/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./utils"], function(wiltoncall, utils) {
    "use strict";

    function put(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            utils.checkProperties(opts, ["key", "value"]);
            var val = utils.defaultJson(opts.value);
            var res = wiltoncall("shared_put", {
                key: opts.key,
                value: val
            });
            var resout = null !== res ? JSON.parse(res) : {};
            utils.callOrIgnore(callback, resout);
            return resout;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function get(key, callback) {
        try {
            var res = wiltoncall("shared_get", {
                key: key
            });
            var resout = null !== res ? JSON.parse(res) : {};
            utils.callOrIgnore(callback, resout);
            return resout;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function waitChange(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            utils.checkProperties(opts, ["timeoutMillis", "key", "currentValue"]);
            var cval = utils.defaultJson(opts.currentValue);
            var res = wiltoncall("shared_wait_change", {
                timeoutMillis: opts.timeoutMillis,
                key: opts.key,
                currentValue: cval
            });
            var resout = null !== res ? JSON.parse(res) : {};
            utils.callOrIgnore(callback, resout);
            return resout;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function remove(key, callback) {
        try {
            var res = wiltoncall("shared_remove", {
                key: key
            });
            var resout = null !== res ? JSON.parse(res) : {};
            utils.callOrIgnore(callback, resout);
            return resout;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function getFromHandle(type, callback) {
        try {
            utils.checkPropertyType(type, "name", "string");
            var handleObj = this.get(type.name);
            utils.checkPropertyType(handleObj, "handle", "number");
            var res = new type(handleObj);
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    return {
        put: put,
        get: get,
        waitChange: waitChange,
        remove: remove,
        getFromHandle: getFromHandle
    };

});
