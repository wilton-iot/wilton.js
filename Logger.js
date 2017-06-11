/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./utils"], function(wiltoncall, utils) {
    "use strict";

    function Logger(name) {
        this.name = utils.defaultString(name, "wilton");
    }

    Logger.initialize = function(config, callback) {
        var opts = utils.defaultObject(config);
        try {
            wiltoncall("logging_initialize", opts);
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    Logger.shutdown = function(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            wiltoncall("logging_shutdown");
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
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
                        msg = utils.formatError(message);
                    } else {
                        try {
                            msg = JSON.stringify(message);
                        } catch (e) {
                            msg = utils.formatError(e);
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
                print(utils.formatError(e));
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
