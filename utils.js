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
 * @namespace utils
 * 
 * __wilton/utils__ \n
 * Utility functions.
 * 
 * This module contains a set of utility function that are used
 * by `wilton.js` internally.
 * 
 * It is suggested to use [Lodash library](https://lodash.com/docs/)
 * (that is shipped with `wilton` distribution) instead of this module
 * for the general-use utilities.
 */
define([], function() {
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
   
    /**
     * @function undefinedOrNull
     * 
     * Check whether specifed value is `undefined` or `null`.
     * 
     * Checks whether specifed value is `undefined` or `null`.
     * 
     * @param obj `Any`
     * @returns `Boolean` `true` if specifed value is `undefined` or `null`,
     *          `false` otherwise
     */
    function undefinedOrNull(obj) {
        return "undefined" === typeof (obj) || null === obj;
    }

    /**
     * @function startsWith
     * 
     * Check whether specified string starts with specified prefix.
     * 
     * Checks whether specified string starts with specified prefix.
     * 
     * @param str `String` string to check
     * @param prefix `String` prefix to check
     * @returns `Boolean` `true` if specified string starts with specified prefix,
     *          `false` otherwise
     */
    function startsWith(str, prefix) {
        if (undefinedOrNull(str) || undefinedOrNull(prefix)) {
            return false;
        }
        return 0 === str.lastIndexOf(prefix, 0);
    }

    /**
     * @function endsWith
     * 
     * Check whether specified string ends with specified postfix.
     * 
     * Checks whether specified string ends with specified postfix.
     * 
     * @param str `String` string to check
     * @param postfix `String` postfix to check
     * @returns `Boolean` `true` if specified string ends with specified postfix,
     *          `false` otherwise
     */
    function endsWith(str, postfix) {
        if (undefinedOrNull(str) || undefinedOrNull(postfix)) {
            return false;
        }
        return str.indexOf(postfix, str.length - postfix.length) !== -1;
    }

    /**
     * @function defaultObject
     * 
     * Return object on any input.
     * 
     * Returns specified object, if it is not-null,
     * returns emtpy object otherwise
     * 
     * @param obj `Object` object to check
     * @returns `Object` specified object, if it is not-null, emtpy object otherwise
     */
    function defaultObject(obj) {
        var res = {};
        if ("object" === typeof (obj) && null !== obj) {
            res = obj;
        }
        return res;
    }

    /**
     * @function defaultString
     * 
     * Return string on any input.
     * 
     * Converts specified value to string.
     * 
     * @param str `Any` input value
     * @returns `String` specified value, if it is a string,
     *          value converted to string otherwise; empty string
     *          on `null`input
     */
    function defaultString(str) {
        if ("string" === typeof (str)) {
            return str;
        } else if (!undefinedOrNull(str)) {
            return String(str);
        } else {
            return "";
        }
    }

    /**
     * @function defaultJson
     * 
     * Convert specified value to JSON.
     * 
     * If specified value is an object - converts it to JSON,
     * if it is a string - returns it unchanged
     * 
     * @param data `Any` input value
     * @returns `String` JSON string, empty JSON object (as a string) on `null` input
     */
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

    /**
     * @function callOrThrow
     * 
     * Call specified callback or throw specified `Error` if callback is `Undefined`.
     * 
     * If function callback is specified, calls it providing
     * specified `Error` as argument. Otherewise throws specified `Error`.
     * 
     * @param onFailure `Function|Undefined` callback to handle the specified `Error`
     * @param e `Error` error to pass to callback or throw
     * @param res `Any|Undefined` result value to return from this function if callback
     *            call was successfull
     * @returns `Any` `res` parameter
     */
    function callOrThrow(onFailure, e, res) {
        if ("function" === typeof (onFailure)) {
            onFailure(e);
            if ("undefined" !== typeof (res)) {
                return res;
            }
        } else {
            if (e instanceof Error) {
                throw e;
            } else if ("object" === typeof(e) && 
                    "string" === typeof(e.message) &&
                    "string" === typeof(e.stack)) {
                throw new Error(e.message);
            } else {
                throw new Error(String(e));
            }
        }
    }
    
    /**
     * @function callOrIgnore
     * 
     * Call specified function (if it is not `Undefined`).
     * 
     * If callback function is specified - calls it passing
     * `null` as a first argument (to adhere with Node's callback conventions)
     * and specified `params` value as a second argument.
     * 
     * @param onSuccess `Function|Undefined` callback
     * @param params `Any|Undefined` callback argument
     * @returns `Undefined`
     */
    function callOrIgnore(onSuccess, params) {
        if ("function" === typeof (onSuccess)) {
            if ("undefined" !== typeof (params)) {
                onSuccess(null, params);
            } else {
                onSuccess(null);
            }
        }
    }

    /**
     * @function listProperties
     * 
     * List properties names of the specified object.
     * 
     * Lists the names of object's own properties.
     * 
     * @param obj `Object` input object
     * @returns `Array` list of properties names
     */
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

    /**
     * @function checkProperties
     * 
     * Check whether object has all specified properties.
     * 
     * Checks whether specified object has all specified properties.
     * 
     * @param obj `Object` input object
     * @param props `Array` list of properties names
     * @returns `Undefined` throws `Error` on check fail
     */
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
    
    /**
     * @function hasProperties
     * 
     * Check whether object has all specified properties.
     * 
     * Checks whether specified object has all specified properties.
     * 
     * @param obj `Object` input object
     * @param props `Array` list of properties names
     * @returns `Boolean` `true` on successful check, `false` otherwise
     */
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

    /**
     * @function checkPropertyType
     * 
     * Check whether object has a specified property with a specified type.
     * 
     * Checks whether object has a specified property with a specified type.
     * 
     * @param obj `Object` input object
     * @param prop `String` property name
     * @param type `String` property type name
     * @returns `Undefined` throws `Error` on check fail
     */
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
    
    /**
     * @function hasPropertyWithType
     * 
     * Check whether object has a specified property with a specified type.
     * 
     * Checks whether object has a specified property with a specified type.
     * 
     * @param obj `Object` input object
     * @param prop `String` property name
     * @param type `String` property type name
     * @returns `Boolean` `true` on successful check, `false` otherwise
     */
    function hasPropertyWithType(obj, prop, type) {
        if (!undefinedOrNull(obj) && "string" === typeof (prop) && "string" === typeof (type)) {
            var actual = typeof (obj[prop]);
            return type === actual;
        }
        return false;
    }
    
    /**
     * @function formatError
     * 
     * Format specifed error.
     * 
     * Formats specified `Error` object into string,
     * including error message and a stack trace.
     * 
     * @param e `Error` error object
     * @return `String` formatted error
     */
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
    
    /**
     * @function promisifyAll
     * 
     * Convert all function in the specified module object to use `Promise`s.
     * 
     * Applies [bluebird promisifyAll](http://bluebirdjs.com/docs/api/promise.promisifyall.html)
     * to the specified object using `Promise` as a postfix for "promisified" functions.
     * 
     * @param obj `Object` module object that has `Function` properties
     * @returns `Object` input object with additionally added "promisified" functions.
     */
    function promisifyAll(obj) {
        var bluebird = WILTON_requiresync("bluebird");
        return bluebird.promisifyAll(obj, {
            suffix: "Promise"
        });
    }
    
    /**
     * @function cloneObject
     * 
     * Deep clone object.
     * 
     * Permforms deep clone of the "plain" object
     * converting it to JSON and returning the parsed result.
     * 
     * @param obj `Object` object to clone
     * @returns `Object` cloned object
     */
    // https://stackoverflow.com/a/5344074/314015
    function cloneObject(obj) {
        if ("object" !== typeof(obj) || undefinedOrNull(obj)) {
            throw new Error("Invalid object specified");
        }
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * @function localeComparator
     * 
     * Compares two strings using `String.prototype.localeCompare()`
     * 
     * Compares two strings using `String.prototype.localeCompare()`.
     * 
     * Non-string input values are coalesced to strings.
     * 
     * Null and undefined input values are colalesced to empty string.
     * 
     * @param str1 `String` first string to compare
     * @param str2 `String` second string to compare
     * @returns `Number` a negative number if the `str1` occurs before `str2`;
     *                   positive if the `str1` occurs after `str2`;
     *                   0 if `str1` and `str2` are equivalent
     */
    function localeComparator(str1, str2) {
        var a = defaultString(str1);
        var b = defaultString(str2);
        return a.localeCompare(b);
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
        hasPropertyWithType: hasPropertyWithType,
        formatError: formatError,
        promisifyAll: promisifyAll,
        cloneObject: cloneObject,
        localeComparator: localeComparator
    };
    
});
