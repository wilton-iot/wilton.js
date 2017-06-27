/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./utils"], function(wiltoncall, utils) {
    "use strict";

    function put(key, value, callback) {
        try {
            var val = utils.defaultJson(value);
            var res = wiltoncall("shared_put", {
                key: key,
                value: val
            });
            var resout = null !== res ? JSON.parse(res) : null;
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
            if (null !== res) {
                var resout = JSON.parse(res);
                utils.callOrIgnore(callback, resout);
                return resout;
            }
            throw new Error("Shared entry not found for key: [" + key + "]");
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
            var resout = null !== res ? JSON.parse(res) : null;
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
            var resout = null !== res ? JSON.parse(res) : null;
            utils.callOrIgnore(callback, resout);
            return resout;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function listAppend(key, value, callback) {
        try {
            var val = utils.defaultJson(value);
            var res = wiltoncall("shared_list_append", {
                key: key,
                value: val
            });
            var resout = JSON.parse(res);
            utils.callOrIgnore(callback, resout);
            return resout;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }    
    
    function dump(callback) {
        try {
            return wiltoncall("shared_dump");
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    return {
        put: put,
        get: get,
        waitChange: waitChange,
        remove: remove,
        listAppend: listAppend,
        dump: dump
    };

});
