/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(function() {
    "use strict";
   
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
            throw new Error(formatError(e));
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
        if ("undefined" !== typeof (WILTON_DUKTAPE) || !(e instanceof Error)) {
            return String(e);
        } else {
            return e.message + "\n" + e.stack;
        }
    }
    
    function promisifyAll(obj) {
        var bluebird = WILTON_requiresync("bluebird");
        return bluebird.promisifyAll(obj, {
            suffix: "Promise"
        });
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
        promisifyAll: promisifyAll
    };
    
});
