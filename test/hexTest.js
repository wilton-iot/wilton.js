
define(["assert", "wilton/hex"], function(assert, hex) {
    "use strict";

    print("test: wilton/hex");
    
    var str = "привет";
    var encoded = hex.encodeUTF8(str);
    var decoded = hex.decodeUTF8(encoded);
    assert.equal(decoded, str);

    assert(hex.isPretty(""));
    assert(hex.isPretty("4f"));
    assert(!hex.isPretty(" 4f"));
    assert(hex.isPretty("4f "));
    assert(hex.isPretty("02 4e 4f 00 00 2e 00 2e"));
    assert(!hex.isPretty("024e4f00002e002e"));

    assert.equal(hex.formatHexAndPlain("024e4f00002e002e"), "02 4e 4f 00 00 2e 00 2e [ NO . .]");
    assert.equal(hex.formatHexAndPlain("02 4e 4f 00 00 2e 00 2e"), "02 4e 4f 00 00 2e 00 2e [ NO . .]");
});
