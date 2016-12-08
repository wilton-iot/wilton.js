/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./nativeLib", "./utils"], function(nativeLib, utils) {
    "use strict";

    // todo: degrade me back to dumb-n-safe implementation

    var Mutex = function(options) {
        var opts = utils.defaultObject(options);
        try {
            if ("Mutex" === opts.type && "number" === typeof(opts.handle)) {
                // load from json
                this.handle = opts.handle;
            } else {
                // create new
                var handleJson = nativeLib.wiltoncall("mutex_create");
                var handleObj = JSON.parse(handleJson);
                this.handle = handleObj.mutexHandle;
            }
            utils.callOrIgnore(opts.onSuccess);
        } catch (e) {
            utils.callOrThrow(opts.onFailure, e);
        }
    };

    Mutex.prototype = {
        synchronized: function(options) {
            var opts = utils.defaultObject(options);
            utils.checkPropertyType(opts, "callback", "function");
            try {
                var data = JSON.stringify({
                    mutexHandle: this.handle
                });
                var res = {};
                try {
                    nativeLib.wiltoncall("mutex_lock", data);
                    res = opts.callback();
                } finally {
                    nativeLib.wiltoncall("mutex_unlock", data);
                }
                utils.callOrIgnore(opts.onSuccess, res);
                return res;
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e, {});
            }
        },
        
        lock: function(options) {
            this._voidcall("lock", options);
        },
        
        unlock: function(options) {
            this._voidcall("unlock", options);
        },
        
        wait: function(options) {
            var opts = utils.defaultObject(options);
            utils.checkPropertyType(opts, "callback", "function");
            utils.checkPropertyType(opts, "timeoutMillis", "number");
            try {
                var cond = new Packages.java.util.concurrent.Callable({
                    call: function() {
                        var res = opts.callback();
                        var resbool = Boolean(res);
                        return JSON.stringify({
                            condition: resbool
                        });
                    }
                });
                nativeLib.wiltoncall("mutex_wait", JSON.stringify({
                    mutexHandle: this.handle,
                    timeoutMillis: opts.timeoutMillis
                }), cond);
                utils.callOrIgnore(opts.onSuccess);
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        },
        
        notifyAll: function(options) {
            this._voidcall("notify_all", options);
        },
        
        destroy: function(options) {
            this._voidcall("destroy", options);
        },
        
        toJson: function() {
            return {
                type: Mutex,
                handle: this.handle
            };
        },
        
        _voidcall: function(name, options) {
            var opts = utils.defaultObject(options);
            try {
                nativeLib.wiltoncall("mutex_" + name, JSON.stringify({
                    mutexHandle: this.handle
                }));
                utils.callOrIgnore(opts.onSuccess);
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        }
    };

    return Mutex;
});
