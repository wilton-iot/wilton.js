/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./utils"], function(wiltoncall, utils) {
    "use strict";

    function put(options) {
        var opts = utils.defaultObject(options);
        utils.checkProperties(opts, ["key", "value"]);
        var val  = utils.defaultJson(opts.value);
        try {
            wiltoncall("shared_put", {
                key: opts.key,
                value: val
            });
            utils.callOrIgnore(opts.onSuccess);
        } catch (e) {
            utils.callOrThrow(opts.onFailure, e);
        }
    }
    
    function get(options) {
        var opts = utils.defaultObject(options);
        utils.checkProperties(opts, ["key"]);
        try {
            var res = wiltoncall("shared_get", {
                key: opts.key
            });
            var resstr = String(res);
            var resout = null;
            if ("" !== resstr) {
                resout = JSON.parse(resstr);
            }
            utils.callOrIgnore(opts.onSuccess, resout);
            return resout;
        } catch (e) {
            utils.callOrThrow(opts.onFailure, e);
        }
    }
    
    function waitChange(options) {
        var opts = utils.defaultObject(options);
        utils.checkProperties(opts, ["timeoutMillis", "key", "currentValue"]);
        try {
            var res = wiltoncall("shared_wait_change", {
                timeoutMillis: opts.timeoutMillis,
                key: opts.key,
                currentValue: opts.currentValue
            });
            var resout = null;
            if ("" !== res) {
                resout = JSON.parse(res);
            }
            utils.callOrIgnore(opts.onSuccess, resout);
            return resout;
        } catch (e) {
            utils.callOrThrow(opts.onFailure, e);
        }
    }
    
    function remove(options) {
        var opts = utils.defaultObject(options);
        utils.checkProperties(opts, ["key"]);
        try {
            wiltoncall("shared_remove", {
                key: opts.key
            });
            utils.callOrIgnore(opts.onSuccess);
        } catch (e) {
            utils.callOrThrow(opts.onFailure, e);
        }
    }
    
    return {
        put: put,
        get: get,
        waitChange: waitChange,
        remove: remove
    };

});
