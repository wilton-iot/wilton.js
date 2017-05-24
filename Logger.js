/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./utils"], function(wiltoncall, utils) {
    "use strict";

    var Logger = function(name) {
        this.name = utils.defaultString(name, "wilton");
    };

    Logger.initialize = function(config) {
        var opts = utils.defaultObject(config);
        var onSuccess = opts.onSuccess;
        var onFailure = opts.onFailure;
        delete opts.onSuccess;
        delete opts.onFailure;
        try {
            wiltoncall("logging_initialize", opts);
            utils.callOrIgnore(onSuccess);
        } catch (e) {
            utils.callOrThrow(onFailure, e);
        }
    };

    Logger.shutdown = function(options) {
        var opts = utils.defaultObject(options);
        try {
            wiltoncall("logging_shutdown");
            utils.callOrIgnore(opts.onSuccess);
        } catch (e) {
            utils.callOrThrow(opts.onFailure, e);
        }
    };

    Logger.prototype = {
        append: function(level, message) {
            try {
                var msg = "";
                if ("undefined" !== typeof (message) && null !== message) {
                    if ("string" === typeof (message)) {
                        msg = message;
                    } else if (message instanceof Error) {
                        // msg = message + "\n" + message.stack;
                        msg = String(message.stack);
                    } else {
                        try {
                            msg = JSON.stringify(message);
                        } catch (e) {
                            if ("undefined" !== typeof(WILTON_DUKTAPE)) {
                                msg = String(message);
                            } else {
                                msg = message.message + "\n" + message.stack;
                            }
                        }
                    }
                }
                wiltoncall("logging_log", {
                    level: level,
                    logger: this.name,
                    message: msg
                });
            } catch (e) {
                print("===LOGGER ERROR:");
                print(e.toString() + "\n" + e.stack);
                print("===LOGGER ERROR END:");
            }
        },
        
        log: function(message) {
            this.append("DEBUG", message);
        },
        
        debug: function(message) {
            this.append("DEBUG", message);
        },
        
        info: function(message) {
            this.append("INFO", message);
        },
        
        warn: function(message) {
            this.append("WARN", message);
        },
        
        error: function(message) {
            this.append("ERROR", message);
        }
    };

    return Logger;

});
