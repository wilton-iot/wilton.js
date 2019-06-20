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
    "wilton/zip"
], function(assert, fs, misc, zip) {
    "use strict";

    if (misc.isAndroid()) {
        return;
    }

    print("test: wilton/zip");
    // chakra "module->DecrementObjectCount()" segfault on shutdown
    // jscript9.dll!Js::WindowsGlobalizationAdapter::~WindowsGlobalizationAdapter()
    if ("chakra" === misc.wiltonConfig().defaultScriptEngine) {
        return;
    }

    // write file
    zip.writeFile("test.zip", {
        foo: "bar",
        baz: "boo"
    });
    zip.writeFile("testHex.zip", {
        foo: "626172",
        baz: "626f6f"
    }, {
        hex: true
    });
    assert(fs.exists("test.zip"));
    assert(fs.stat("test.zip").size > 0);
    assert(fs.exists("testHex.zip"));
    assert(fs.stat("testHex.zip").size > 0);

    // list entries (alphabetic order)
    assert.deepEqual(zip.listFileEntries("test.zip"), ["baz", "foo"]);
    assert.deepEqual(zip.listFileEntries("testHex.zip"), ["baz", "foo"]);

    // read entry
    assert.equal(zip.readFileEntry("test.zip", "foo"), "bar");
    assert.equal(zip.readFileEntry("test.zip", "foo", {hex: true}), "626172");
    assert.equal(zip.readFileEntry("test.zip", "baz"), "boo");
    assert.equal(zip.readFileEntry("test.zip", "baz", {hex: true}), "626f6f");
    assert.equal(zip.readFileEntry("testHex.zip", "foo"), "bar");
    assert.equal(zip.readFileEntry("testHex.zip", "foo", {hex: true}), "626172");
    assert.equal(zip.readFileEntry("testHex.zip", "baz"), "boo");
    assert.equal(zip.readFileEntry("testHex.zip", "baz", {hex: true}), "626f6f");

    // read file
    assert.deepEqual(zip.readFile("test.zip"), {
        foo: "bar",
        baz: "boo"
    });
    assert.deepEqual(zip.readFile("testHex.zip", {hex: true}), {
        foo: "626172",
        baz: "626f6f"
    });

    // cleanup
    fs.unlink("test.zip");
    fs.unlink("testHex.zip");
});
