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

define(["assert", "wilton/hex"], function(assert, hex) {
    "use strict";

    print("test: wilton/hex");
    
    var str = "привет";
    var encoded = hex.encodeUTF8(str);
    var decoded = hex.decodeUTF8(encoded);
    assert.equal(decoded, str);
    var pretty = hex.prettify(encoded);
    var decodedPretty = hex.decodeUTF8(pretty);
    assert.equal(decodedPretty, str);

    assert(hex.isPretty(""));
    assert(hex.isPretty("4f"));
    assert(!hex.isPretty(" 4f"));
    assert(hex.isPretty("4f "));
    assert(hex.isPretty("02 4e 4f 00 00 2e 00 2e"));
    assert(!hex.isPretty("024e4f00002e002e"));

    assert.equal(hex.formatHexAndPlain("024e4f00002e002e"), "02 4e 4f 00 00 2e 00 2e [ NO . .]");
    assert.equal(hex.formatHexAndPlain("02 4e 4f 00 00 2e 00 2e"), "02 4e 4f 00 00 2e 00 2e [ NO . .]");
});
