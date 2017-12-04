
define([
    "assert",
    "wilton/fs",
    "wilton/zip"
], function(assert, fs, zip) {
    "use strict";

    print("test: wilton/zip");

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

    // list entries
    assert.deepEqual(zip.listFileEntries("test.zip"), ["foo", "baz"]);
    assert.deepEqual(zip.listFileEntries("testHex.zip"), ["foo", "baz"]);

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
