/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(function() {
    "use strict";
   
    var engineName = function() {
        // direct call to not require misc
        var conf = WILTON_wiltoncall("get_wiltoncall_config", "{}");
        var obj = JSON.parse(conf);
        if ("string" !== typeof(obj.defaultScriptEngine)) {
            throw new Error("Invalid incomplete wiltoncall config: [" + conf + "]");
        }
        return obj.defaultScriptEngine;
    } ();
   
    function undefinedOrNull(obj) {
        return "undefined" === typeof (obj) || null === obj;
    }

    function startsWith(str, prefix) {
        if (undefinedOrNull(str) || undefinedOrNull(prefix)) {
            return false;
        }
        return 0 === str.lastIndexOf(prefix, 0);
    }

    function endsWith(str, suffix) {
        if (undefinedOrNull(str) || undefinedOrNull(suffix)) {
            return false;
        }
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    function defaultObject(options) {
        var opts = {};
        if ("object" === typeof (options) && null !== options) {
            opts = options;
        }
        return opts;
    }

    function defaultString(str, value) {
        if ("string" === typeof (str)) {
            return str;
        } else if (!undefinedOrNull(str)) {
            return String(str);
        } else {
            if ("undefined" !== typeof (value)) {
                return value;
            } else {
                return "";
            }
        }
    }

    function defaultJson(data) {
        var json = "{}";
        if (!undefinedOrNull(data)) {
            if ("string" === typeof (data)) {
                json = data;
            } else {
                json = JSON.stringify(data, null, 4);
            }
        }
        return json;
    }

    function callOrThrow(onFailure, e, res) {
        if ("function" === typeof (onFailure)) {
            onFailure(e);
            if ("undefined" !== typeof (res)) {
                return res;
            }
        } else {
            if (e instanceof Error) {
                throw e;
            } else {
                throw new Error(String(e));
            }
        }
    }
    
    function callOrIgnore(onSuccess, params) {
        if ("function" === typeof (onSuccess)) {
            if ("undefined" !== typeof (params)) {
                onSuccess(null, params);
            } else {
                onSuccess(null);
            }
        }
    }

    function listProperties(obj) {
        var res = [];
        if (!undefinedOrNull(obj)) {
            for (var pr in obj) {
                if (obj.hasOwnProperty(pr)) {
                    res.push(pr);
                }
            }
        }
        return res;
    }

    function checkProperties(obj, props) {
        if (undefinedOrNull(obj)) {
            throw new Error("'checkProperties' error: specified object is invalid");
        }
        if (undefinedOrNull(props) || !(props instanceof Array) || 0 === props.length) {
            throw new Error("'checkProperties' error: specified props are invalid");
        }
        for (var i = 0; i < props.length; i++) {
            var pr = props[i];
            if ("string" !== typeof (pr)) {
                throw new Error("'checkProperties' error:" +
                        " invalid non-string property name: [" + pr + "], object: [" + listProperties(obj) + "]");
            }
            if (!obj.hasOwnProperty(pr)) {
                throw new Error("'checkProperties' error:" +
                        " missed property name: [" + pr + "], object: [" + listProperties(obj) + "]");
            }
        }
    }
    
    function hasProperties(obj, props) {
        if (undefinedOrNull(obj)) {
            throw new Error("'hasProperties' error: specified object is invalid");
        }
        if (undefinedOrNull(props) || !(props instanceof Array) || 0 === props.length) {
            throw new Error("'hasProperties' error: specified props are invalid");
        }
        for (var i = 0; i < props.length; i++) {
            var pr = props[i];
            if ("string" !== typeof (pr)) {
                throw new Error("'hasProperties' error:" +
                        " invalid non-string property name: [" + pr + "], object: [" + listProperties(obj) + "]");
            }
            if (!obj.hasOwnProperty(pr)) {
                return false;
            }
        }
        return true;
    }

    function checkPropertyType(obj, prop, type) {
        if (undefinedOrNull(obj)) {
            throw new Error("'checkPropertyType' error: specified object is invalid");
        }
        if ("string" !== typeof (prop)) {
            throw new Error("'checkPropertyType' error: specified prop is invalid");
        }
        if ("string" !== typeof (type)) {
            throw new Error("'checkPropertyType' error: specified type is invalid");
        }
        var actual = typeof (obj[prop]);
        if (type !== actual) {
            throw new Error("Invalid attribute specified, name: [" + prop + "]," +
                    " required type: [" + type + "], actual type: [" + actual + "]," +
                    " object: [" + listProperties(obj) + "]");
        }
    }
    
    function checkEmptyObject(obj) {
        if (undefinedOrNull(obj)) {
            throw new Error("'checkEmptyObject' error: specified object is invalid");
        }
        var props = listProperties(obj);
        if (0 !== props.length) {
            throw new Error("'checkEmptyObject' error: specified object is not empty," +
                    " object: [" + props + "]");
        }
    }
    
    function hasPropertyWithType(obj, prop, type) {
        if (!undefinedOrNull(obj) && "string" === typeof (prop) && "string" === typeof (type)) {
            var actual = typeof (obj[prop]);
            return type === actual;
        }
        return false;
    }
    
    function formatError(e) {
        if (e instanceof Error) {
            if ("duktape" === engineName) {
                return e.stack;
            } else {
                return e.message + "\n" + e.stack;
            }
        } else {
            return String(e);
        }
    }
    
    function promisifyAll(obj) {
        var bluebird = WILTON_requiresync("bluebird");
        return bluebird.promisifyAll(obj, {
            suffix: "Promise"
        });
    }
    
    // https://stackoverflow.com/a/5344074/314015
    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    // https://stackoverflow.com/a/22373061/314015
    /* utf.js - UTF-8 <=> UTF-16 convertion
     *
     * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
     * Version: 1.0
     * LastModified: Dec 25 1999
     * This library is free.  You can redistribute it and/or modify it.
     */
    function _utf8ArrayToStr(array) {
        var out, i, len, c;
        var char2, char3;

        out = "";
        len = array.length;
        i = 0;
        while (i < len) {
            c = array[i++];
            switch (c >> 4)
            {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    out += String.fromCharCode(c);
                    break;
                case 12:
                case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = array[i++];
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = array[i++];
                    char3 = array[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) |
                            ((char2 & 0x3F) << 6) |
                            ((char3 & 0x3F) << 0));
                    break;
            }
        }

        return out;
    }
    
    function hexToString(hex) {
        var arr = [];
        var i = 0;
        if (hex.length > 2 && '0' === hex[0] &&
                ('x' === hex[1] || 'X' === hex[1])) {
            i += 2;
        }
        for (; i < hex.length; i += 2) {
            var num = parseInt(hex.substr(i, 2), 16);
            arr.push(num);
        }
        return _utf8ArrayToStr(arr);
    }

    return {
        undefinedOrNull: undefinedOrNull,
        startsWith: startsWith,
        endsWith: endsWith,
        defaultObject: defaultObject,
        defaultString: defaultString,
        defaultJson: defaultJson,
        callOrThrow: callOrThrow,
        callOrIgnore: callOrIgnore,
        listProperties: listProperties,
        checkProperties:checkProperties,
        hasProperties:hasProperties,
        checkPropertyType: checkPropertyType,
        checkEmptyObject: checkEmptyObject,
        hasPropertyWithType: hasPropertyWithType,
        formatError: formatError,
        promisifyAll: promisifyAll,
        clone: clone,
        hexToString: hexToString
    };
    
});
