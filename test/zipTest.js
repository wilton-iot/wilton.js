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
    "wilton/misc",
    "wilton/zip",
    "./_scratchDir"
], function(assert, fs, misc, zip, scratchDir) {
    "use strict";

    print("test: wilton/zip");
    var dir = scratchDir + "zipTest/";
    fs.mkdir(dir);

    // chakra "module->DecrementObjectCount()" segfault on shutdown
    // jscript9.dll!Js::WindowsGlobalizationAdapter::~WindowsGlobalizationAdapter()
    if ("chakra" === misc.wiltonConfig().defaultScriptEngine) {
        return;
    }

    var testZip = dir + "test.zip";
    var testHexZip = dir + "testHex.zip";

    // write file
    zip.writeFile(testZip, {
        foo: "bar",
        baz: "boo"
    });
    zip.writeFile(testHexZip, {
        foo: "626172",
        baz: "626f6f"
    }, {
        hex: true
    });
    assert(fs.exists(testZip));
    assert(fs.stat(testZip).size > 0);
    assert(fs.exists(testHexZip));
    assert(fs.stat(testHexZip).size > 0);

    // list entries (alphabetic order)
    assert.deepEqual(zip.listFileEntries(testZip), ["baz", "foo"]);
    assert.deepEqual(zip.listFileEntries(testHexZip), ["baz", "foo"]);

    // read entry
    assert.equal(zip.readFileEntry(testZip, "foo"), "bar");
    assert.equal(zip.readFileEntry(testZip, "foo", {hex: true}), "626172");
    assert.equal(zip.readFileEntry(testZip, "baz"), "boo");
    assert.equal(zip.readFileEntry(testZip, "baz", {hex: true}), "626f6f");
    assert.equal(zip.readFileEntry(testHexZip, "foo"), "bar");
    assert.equal(zip.readFileEntry(testHexZip, "foo", {hex: true}), "626172");
    assert.equal(zip.readFileEntry(testHexZip, "baz"), "boo");
    assert.equal(zip.readFileEntry(testHexZip, "baz", {hex: true}), "626f6f");

    // read file
    assert.deepEqual(zip.readFile(testZip), {
        foo: "bar",
        baz: "boo"
    });
    assert.deepEqual(zip.readFile(testHexZip, {hex: true}), {
        foo: "626172",
        baz: "626f6f"
    });

    // cleanup
    fs.unlink(testZip);
    fs.unlink(testHexZip);

    fs.rmdir(dir);
});
