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

/**
 * @namespace hex
 * 
 * __wilton/hex__ \n
 * Convert strings into hexadecimal encoding and back
 * 
 * This module provides utility function to encode arbitrary strings
 * as hexadecimal and to parse hexadecimal data.
 * 
 * When converting to/from `JavaScript` `String`s, data can be
 * handled as a "plain binary" (`(encode|decode)Bytes` functions - each byte is converted to/from hex as is)
 * or as Unicode data (`(encode|decode)UTF8` functions).
 * 
 * In Unicode case, on encoding `String` is converted to `UTF-8` first and then `UTF-8` bytes
 * are encoded into hex. On decoding, hex bytes are treated as `UTF-8` encoded and converted to `UTF-16`
 * before returing a `String`.
 * 
 * Additonally contains utility functions to pretty-print hex-encoded data.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // encode
 * var hd = hex.encodeBytes("foo"); // "666f6f"
 * var phd = hex.prettify(hd); // "66 6f 6f"
 * var uhd = hex.encodeUTF8("привет"); // "d0bfd180d0b8d0b2d0b5d182"
 * 
 * // decode
 * var dec1 = hex.decodeBytes("66 6f 6f"); // "foo"
 * var dec2 = hex.decodeUTF8("d0 bf d1 80 d0 b8 d0 b2 d0 b5 d1 82") // "привет"
 * 
 * @endcode
 * 
 */
define([
    "utf8",
    "./utils"
], function(utf8, utils) {
    "use strict";

    var SYMBOLS = "0123456789abcdef";

    /**
     * @function encodeBytes
     * 
     * Encode "byte" string as hexadecimal.
     * 
     * Encodes input string as hexadecimal treating each input symbol
     * as a char code.
     * 
     * @param str `String` "byte" string to encode
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` string in hexadecimal encoding
     */
    // http://stackoverflow.com/a/18025541/314015
    function encodeBytes(str, callback) {
        try {
            if ("string" !== typeof(str)) {
                throw new Error("Invalid non-string input specified: [" + str + "]");
            }
            var resp = "";
            for (var i = 0; i < str.length; i++) {
                var code = str.charCodeAt(i);
                var idx = code >> 4;
                resp += SYMBOLS[idx];
                idx = code & 0x0f;
                resp += SYMBOLS[idx];
            }
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    /**
     * @function encodeUTF8
     * 
     * Encode Unicode string as `UTF-8` hexadecimal.
     * 
     * Encodes input string into `UTF-8` and then encodes resulting
     * string using `encodeBytes()`.
     * 
     * @param str `String` string to encode
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` string in hexadecimal encoding
     */
    function encodeUTF8(str, callback) {
        try {
            if ("string" !== typeof(str)) {
                throw new Error("Invalid non-string input specified: [" + str + "]");
            }
            var ustr = utf8.encode(str);
            var resp = encodeBytes(ustr);
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    /**
     * @function isPretty
     * 
     * Check whether specified hex-string is "prettified".
     * 
     * Check whether specified hex-string contains
     * spacess after each second symbol.
     * 
     * @param hexstr `String` string in hexadecimal encoding
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Boolean` whether hex-string is "prettified"
     */
    function isPretty(hexstr, callback) {
        try {
            if ("string" !== typeof(hexstr)) {
                throw new Error("Invalid non-string input specified: [" + str + "]");
            }
            var resp = true;
            if (hexstr.length >= 3) {
                for (var i = 2; i < hexstr.length; i+=3) {
                    if (" " !== hexstr[i]) {
                        resp = false;
                        break;
                    }
                }
            }
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function prettify
     * 
     * Pretty-print hex-string.
     * 
     * Formats hex-string adding a space after each second symbol.
     * 
     * Does nothing if input string is already "prettified".
     * 
     * @param hexstr `String` string in hexadecimal encoding
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` "prettified" hex-string
     */
    function prettify(hexstr, callback) {
        try {
            if ("string" !== typeof(hexstr)) {
                throw new Error("Invalid non-string input specified: [" + str + "]");
            }
            var resp = "";
            if (isPretty(hexstr)) {
                resp = hexstr;
            } else {
                if (0 !== (hexstr.length % 2)) {
                    throw new Error("Invalid non-hexstring input specified: [" + hexstr + "]");
                }
                for (var i = 0; i < hexstr.length; i += 2 ) {
                    if (resp.length > 0) {
                        resp += " ";
                    }
                    resp += hexstr[i];
                    resp += hexstr[i + 1];
                }
            }
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
           utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function uglify
     * 
     * Convert "prettified" hex-string into plain hex-string
     * 
     * "Un-prettify" hex-string effectively stripping all whitespace
     * symbols from it.
     * 
     * @param hexstr `String` string in hexadecimal encoding
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` "un-prettified" hex-string
     */
    function uglify(hexstr, callback) {
        try {
            if ("string" !== typeof(hexstr)) {
                throw new Error("Invalid non-string input specified");
            }
            var resp = hexstr.replace(/\s+/g, "");
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function decodeBytes
     * 
     * Decode hex-string into "byte" string.
     * 
     * Decodes hex-string into `String` treating each hex-encoded byte
     * as a char code.
     * 
     * @param hexstr `String` string in hexadecimal encoding
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` decoded string
     */
    function decodeBytes(hexstr, callback) {
        try {
            if ("string" !== typeof(hexstr)) {
                throw new Error("Invalid non-string input specified");
            }
            var uhex = isPretty(hexstr) ? uglify(hexstr) : hexstr;
            if (0 !== (uhex.length % 2)) {
                throw new Error("Invalid non-hexstring input specified");
            }
            var resp = "";
            var i = 0;
            if (uhex.length > 2 && '0' === uhex[0] &&
                    ('x' === uhex[1] || 'X' === uhex[1])) {
                i += 2;
            }
            for (; i < uhex.length; i += 2) {
                var num = parseInt(uhex.substr(i, 2), 16);
                resp += String.fromCharCode(num);
            }
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function decodeUTF8
     * 
     * Decode `UTF-8` hex-string.
     * 
     * Decodes hex-string using `decodeBytes()` and then
     * decodes resulting string from `UTF-8`.
     * 
     * @param hexstr `String` string in hexadecimal encoding
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` decoded string
     */
    function decodeUTF8(hexstr, callback) {
        try {
            var bytes = decodeBytes(hexstr);
            var resp = utf8.decode(bytes);
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function replaceNonPrintable
     * 
     * Replace non-printable chars in hex-string.
     * 
     * Replaces non-printable ASCII chars (codes from `0` to `8`)
     * with spaces.
     * 
     * @param hexstr `String` string in hexadecimal encoding
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` hex-string with non-printable chars replaced
     */
    function replaceNonPrintable(hexstr, callback) {
        try {
            if ("string" !== typeof(hexstr)) {
                throw new Error("Invalid non-string input specified");
            }
            var st = decodeBytes(hexstr);
            var target = "";
            for (var i = 0; i < st.length; i++) {
                var code = st.charCodeAt(i);
                target += code >= 32 ? st[i] : " ";
            }
            var resp = encodeBytes(target);
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function formatHexAndPlain
     * 
     * Format hex-string as a hex+plain string.
     * 
     * Formats specified hex-string as a `hex [plain]` string.
     * Non-printable characters in plain string are replaced with spaces.
     * 
     * Intended to be used for logging.
     * 
     * @param hexstr `String` string in hexadecimal encoding
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` formatted string
     */
    function formatHexAndPlain(hexstr, callback) {
        try {
            if ("string" !== typeof(hexstr)) {
                throw new Error("Invalid non-string input specified");
            }
            var prettyHex = prettify(hexstr);
            var printableHex = replaceNonPrintable(hexstr);
            var plain = decodeBytes(printableHex);
            var plainSingleLine = plain.replace(/\s+/g, " ");
            var resp = prettyHex + " [" + plainSingleLine + "]";
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return {
        encodeBytes: encodeBytes,
        encodeUTF8: encodeUTF8,
        decodeBytes: decodeBytes,
        decodeUTF8: decodeUTF8,
        isPretty: isPretty,
        prettify: prettify,
        uglify: uglify,
        replaceNonPrintable: replaceNonPrintable,
        formatHexAndPlain: formatHexAndPlain
    };
});
