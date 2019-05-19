/*
 * Copyright 2017, alex at staticlibs.net
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define([
    "assert",
    "wilton/fs",
    "wilton/misc"
], function(assert, fs, misc) {
    "use strict";

    print("test: wilton/fs");

    var appdir = misc.wiltonConfig().applicationDirectory;

    // cleanup possible remnants
    var fstest = appdir + "fstest";
    if (fs.exists(fstest)) {
        fs.rmdir(fstest);
    }

    // mkdir
    fs.mkdir(fstest);

    var tf = fstest + "/appendFile_test.txt";
 
    // writeFile
    fs.writeFile(tf, "foo");
    // appendFile
    fs.appendFile(tf, "bar");

    // readFile
    assert.equal(fs.readFile(tf), "foobar");
    // read as hex
    assert.equal(fs.readFile(tf, {
        hex: true
    }), "666f6f626172");

    // write and append hex
    fs.writeFile(tf, "666f6f", {
        hex: true
    });
    fs.appendFile(tf, "626172", {
        hex: true
    });
    assert.equal(fs.readFile(tf), "foobar");

    // resizeFile
    var rsf = fstest + "/resize_test.txt";
    fs.resizeFile(rsf, 6);
    var stat_rsf = fs.stat(rsf);
    assert.equal(stat_rsf.size, 6);

    fs.resizeFile(rsf, 12);
    stat_rsf = fs.stat(rsf);
    assert.equal(stat_rsf.size, 12);

    // insertFile
    fs.insertFile(tf, rsf, 0);
    fs.insertFile(tf, rsf, 6);
    assert.equal(fs.readFile(rsf), "foobarfoobar");

    // exists
    assert(fs.exists(fstest));
    assert(fs.exists(tf));

    // readdir
    assert(fs.readdir(fstest)[0], "appendFile_test.txt");

    // stat
    var sdir = fs.stat(fstest);
    assert(!sdir.isFile);
    assert(!fs.isFile(fstest));
    assert(sdir.isDirectory);
    assert(fs.isDirectory(fstest));
    var sfile = fs.stat(tf);
    assert(sfile.isFile);
    assert(fs.isFile(tf));
    assert(!sfile.isDirectory);
    assert(!fs.isDirectory(tf));

    // copy
    var tfCopied = fstest + "/appendFile_test_copied.txt";
    fs.copyFile(tf, tfCopied);
    assert(fs.exists(tf));
    assert(fs.exists(tfCopied));
    assert.equal(fs.readFile(tfCopied), "foobar");
    fs.unlink(tfCopied);
    assert(!fs.exists(tfCopied));

    // rename
    var tfMoved = fstest + "/appendFile_test_moved.txt";
    fs.rename(tf, tfMoved);
    assert(!fs.exists(tf));
    assert(fs.exists(tfMoved));

    // unlink
    fs.unlink(tfMoved);
    assert(!fs.exists(tfMoved));

    // readLines
    var tflines = fstest + "/readLines_test.txt";

    // writeFile
    fs.writeFile(tflines, "foo\n");
    fs.appendFile(tflines, "bar\r\n");
    fs.appendFile(tflines, "\r\n");
    fs.appendFile(tflines, "42\n");
    var li = fs.readLines(tflines);
    assert.equal(li.length, 3);
    assert.equal(li[0], "foo");
    assert.equal(li[1], "bar");
    assert.equal(li[2], "42");

    // write, overwrite and append list
    var tfarr = fstest + "/appendList_test.txt";
    fs.writeFile(tfarr, ["foo", "bar"]);
    fs.writeFile(tfarr, ["baz", "boo", "\n"]);
    fs.appendFile(tfarr, ["666f6f", "626172"], {
        hex: true,
        delimiter: ""
    });
    var li = fs.readLines(tfarr);
    assert.equal(li.length, 3);
    assert.equal(li[0], "baz");
    assert.equal(li[1], "boo");
    assert.equal(li[2], "foobar");

    // not needed - rmdir is recursive
    //fs.unlink(tflines);
    //assert(!fs.exists(tflines));

    // copyDirectory
    fs.mkdir(fstest + "/dir1");
    fs.mkdir(fstest + "/dir1/dir11");
    fs.mkdir(fstest + "/dir1/dir12");
    fs.writeFile(fstest + "/dir1/foo.txt", "foo");
    fs.writeFile(fstest + "/dir1/dir12/bar.txt", "bar");
    var fstest1 = appdir + "fstest1";
    fs.copyDirectory(fstest, fstest1);
    assert.deepEqual(fs.readdir(fstest1), fs.readdir(fstest));
    assert.deepEqual(fs.readdir(fstest1 + "/dir1"), fs.readdir(fstest + "/dir1"));
    assert.deepEqual(fs.readdir(fstest1 + "/dir1/dir12"), fs.readdir(fstest + "/dir1/dir12"));

    // symlinks, supported on win64, but not on win32
    // android fails this with unsufficient permissions
    if (!misc.isWindows() && !misc.isAndroid()) {
        var dest = fstest + "/dest.file";
        var link = fstest + "/dest.file.link";
        fs.writeFile(dest, "foo");
        fs.symlink(dest, link);
        assert.equal(fs.readFile(link), "foo");
        assert(fs.exists(link));
        fs.unlink(link);
        assert(!fs.exists(link));
        assert(fs.exists(dest));
    }

    // rmdir
    fs.rmdir(fstest);
    assert(!fs.exists(fstest));
    fs.rmdir(fstest1);
    assert(!fs.exists(fstest1));

    // realpath
    assert(fs.realpath(appdir + "..").length > 1);
});
