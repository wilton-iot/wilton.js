/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["assert", "wilton/fs", "wilton/utils"], function(assert, fs, utils) {
    "use strict";

    print("test: wilton/fs");

    // mkdir
    fs.mkdir("fstest");

    // appendFile
    var tf = "fstest/appendFile_test.txt";
    
    // writeFile
    fs.writeFile(tf, "foo");
    fs.appendFile(tf, "bar");
    
    // readFile
    assert.equal(fs.readFile(tf), "foobar");
    
    // exists
    assert(fs.exists("fstest"));
    assert(fs.exists(tf));
    
    // readdir
    assert(fs.readdir("fstest")[0], "appendFile_test.txt");
    
    // stat
    var sdir = fs.stat("fstest");
    assert(!sdir.isFile);
    assert(sdir.isDirectory);
    var sfile = fs.stat(tf);
    assert(sfile.isFile);
    assert(!sfile.isDirectory);
    
    // copy
    var tfCopied = "fstest/appendFile_test_copied.txt";
    fs.copyFile(tf, tfCopied);
    assert(fs.exists(tf));
    assert(fs.exists(tfCopied));
    assert.equal(fs.readFile(tfCopied), "foobar");
    fs.unlink(tfCopied);
    assert(!fs.exists(tfCopied));
    
    // rename
    var tfMoved = "fstest/appendFile_test_moved.txt";
    fs.rename(tf, tfMoved);
    assert(!fs.exists(tf));
    assert(fs.exists(tfMoved));
    
    // unlink
    fs.unlink(tfMoved);
    assert(!fs.exists(tfMoved));
    
    // rmdir
    fs.rmdir("fstest");
    assert(!fs.exists("fstest"));

});
