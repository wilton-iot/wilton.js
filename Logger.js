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
