
define(["utf8", "./utils"], function(utf8, utils) {
    "use strict";

    var symbols = "0123456789abcdef";

    // http://stackoverflow.com/a/18025541/314015
    function encodeBytes(str, callback) {
        try {
            if ("string" !== typeof(str)) {
                throw new Error("Invalid non-string input specified");
            }
            var resp = "";
            for (var i = 0; i < str.length; i++) {
                var code = str.charCodeAt(i);
                var idx = code >> 4;
                resp += symbols[idx];
                idx = code & 0x0f;
                resp += symbols[idx];
            }
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function encodeUTF8(str, callback) {
        try {
            if ("string" !== typeof(str)) {
                throw new Error("Invalid non-string input specified");
            }
            var ustr = utf8.encode(str);
            var resp = encodeBytes(ustr);
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    function decodeBytes(hexstr, callback) {
        try {
            if ("string" !== typeof(hexstr)) {
                throw new Error("Invalid non-string input specified");
            }
            var resp = "";
            var i = 0;
            if (hexstr.length > 2 && '0' === hexstr[0] &&
                    ('x' === hexstr[1] || 'X' === hexstr[1])) {
                i += 2;
            }
            for (; i < hexstr.length; i += 2) {
                var num = parseInt(hexstr.substr(i, 2), 16);
                resp += String.fromCharCode(num);
            }
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

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

    function prettify(hexstr, callback) {
        try {
            if ("string" !== typeof(hexstr) || 0 !== (hexstr.length % 2)) {
                throw new Error("Invalid non-hexstring input specified");
            }
            var resp = "";
            for (var i = 0; i < hexstr.length; i += 2 ) {
                if (resp.length > 0) {
                    resp += " ";
                }
                resp += hexstr[i];
                resp += hexstr[i + 1];
            }
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
           utils.callOrThrow(callback, e);
        }
    }

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

    return {
        encodeBytes: encodeBytes,
        encodeUTF8: encodeUTF8,
        decodeBytes: decodeBytes,
        decodeUTF8: decodeUTF8,
        prettify: prettify,
        uglify: uglify
    };
});
