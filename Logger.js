/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./nativeLib", "./utils"], function(nativeLib, utils) {
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
            nativeLib.wiltoncall("logger_initialize", JSON.stringify(opts));
            utils.callOrIgnore(onSuccess);
        } catch (e) {
            utils.callOrThrow(onFailure, e);
        }
    };

    Logger.shutdown = function(options) {
        var opts = utils.defaultObject(options);
        try {
            nativeLib.wiltoncall("logger_shutdown");
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
                        msg = message + "\n" + message.stack;
                    } else {
                        try {
                            msg = JSON.stringify(message);
                        } catch (e) {
                            msg = String(message);
                        }
                    }
                }
                var data = JSON.stringify({
                    level: level,
                    logger: this.name,
                    message: msg
                });
                nativeLib.wiltoncall("logger_log", data);
            } catch (e) {
                nativeLib.printStdout("===LOGGER ERROR:");
                nativeLib.printStdout(e.toString() + "\n" + e.stack);
                nativeLib.printStdout("===LOGGER ERROR END:");
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
