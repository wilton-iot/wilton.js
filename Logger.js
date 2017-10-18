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
 * @namespace Logger
 * 
 * __wilton/Logger__ \n
 * Log messages to console or log file.
 * 
 * This module allows to log arbitrary messages. It is implemented on top of
 * [log4cplus](https://github.com/log4cplus/log4cplus) logging library.
 * 
 * Message filtering is based on a specified log level and on a logger name.
 * Loggers are ususally named using "dot notation": `myapp.somemodule`, `myapp.somemodule.submodule` etc.
 * Allowed logging level configured for "parent" logger (named `myapp` in this case 
 * will apply to these examples unless special logging level will be configured for them.
 * 
 * For most applications (excluding small scripts) it is expected that logging is configured
 * using `Logger.initialize()` during the application startup.
 * 
 * `Logger` instances are effectively "stateless" (only state is a logger name) -
 * they don't hold additional native resources through handles.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // init logging once at app startup
 * var appdir = misc.wiltonConfig().applicationDirectory;
 * Logger.initialize({
 *     appenders: [
 *         {
 *             appenderType: "DAILY_ROLLING_FILE",
 *             thresholdLevel: "DEBUG",
 *             filePath: appdir + "log/myapp_log.txt"
 *         },
 *         {
 *             appenderType: "CONSOLE",
 *             thresholdLevel: "WARN"
 *         }
 *     ],
 *     loggers: [
 *         {
 *             name: "wilton",
 *             level: "WARN"
 *         }, {
 *             name: "myapp",
 *             level: "INFO"
 *         }, {
 *             name: "myapp.somemodule.submodule",
 *             level: "DEBUG"
 *         }
 *     ]
 * });
 * 
 * // create logger instance
 * var logger = new Logger("myapp.somemodule.submodule");
 * 
 * // log messages
 * logger.debug("foo");
 * logger.info("bar");
 * logger.warn("baz");
 * 
 * @endcode
 * 
 */
define([
    "./dyload",
    "./utils",
    "./wiltoncall"
], function(dyload, utils, wiltoncall) {
    "use strict";

    dyload({
        name: "wilton_logging"
    });

    /**
     * @function Logger
     * 
     * Create Logger instance.
     * 
     * Creates Logger object instace with the specified name,
     * that will be used to select the filtering level for all messages
     * logged through this instance.
     * 
     * Created instance doesn't hold any additional native resources
     * and doesn't need to be closed/destroyed explicitely.
     * 
     * @param name `String|Undefined` logger name, default value: `wilton`
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` Logger instance
     */ 
    function Logger(name, callback) {
        var lnm = utils.defaultString(name, "wilton");
        this.name = lnm.replace(/\//g, ".");
        utils.callOrIgnore(callback);
    }

    /**
     * @static initialize
     * 
     * Initialize process-wide logging.
     * 
     * Initializes logging subsystem 
     * 
     * Should be called as early as possible on application startup.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     * 
     * __Options__
     *  - __appenders__ `Array` list of appenders (log destinations) to configure
     *    - __appenderType__ `String` type of the appender, supported values:
     *                      `NULL`, `CONSOLE`, `FILE`, `DAILY_ROLLING_FILE`
     *    - __filePath__ `String|Undefined` path to the log file, relative path
     *                   is resolved against current application directory path
     *                   (that is one level above the executable directory path).
     *    - __layout__ `String|Undefined` formatting layout for log messages,
     *                 see [log4cplus docs](http://log4cplus.sourceforge.net/docs/html/classlog4cplus_1_1PatternLayout.html#details) for details,
     *                 default value: `%d{%Y-%m-%d %H:%M:%S,%q} [%-5p %-5.5t %-20.20c] %m%n`
     *    - __thresholdLevel__ `String|Undefined` minimal logging level for this appender,
     *                         supported values: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`
     *    - __useLockFile__ `Boolean|Undefined` whether to use lock file for `DAILY_ROLLING_FILE` appender,
     *                      default value: `false`
     *    - __maxBackupIndex__ `Integer|Undefined` max number of old (rolled over) log files for
     *                         `DAILY_ROLLING_FILE` appender, default value: `16`
     *  - __loggers__ `Array` list of loggers to configure minimal allowed logging levels
     *    - __name__ `String` logger name
     *    - __level__ `String` minimal allowed logging level for this logger,
     *                         supported values: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`
     */
    Logger.initialize = function(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            wiltoncall("logging_initialize", opts);
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    /**
     * @static initConsole
     * 
     * Shotcut function for console-only logging initialization.
     * 
     * Initializes logging subsystem using only `CONSOLE` appender
     * and without using specific settings for separate logger.
     * 
     * @param threshold `String` threshold logging level for `CONSOLE` appender, must be
     *                  one of `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     * 
     */
    Logger.initConsole = function(threshold, callback) {
        try {
            Logger.initialize({
                appenders: [{
                        appenderType: "CONSOLE",
                        thresholdLevel: threshold 
                }]
            });
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @static shutdown
     * 
     * Deinitialize logging subsystem.
     * 
     * Deinitialization is an optional operation,
     * logging subsystem will be deinitilized automatically
     * during the shutdown.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     */
    Logger.shutdown = function(callback) {
        try {
            wiltoncall("logging_shutdown");
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    Logger.prototype = {
        /**
         * @function log
         * 
         * Log specified message using `DEBUG` logging level.
         * 
         * Logs specified message using `DEBUG` logging level.
         * 
         * `String` messages are logged as-is, `Object`s are 
         * converted to JSON, stacktrace are extracted from specified `Error`s.
         * 
         * @param message `String|Object|Error` message to log
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        log: function(message, callback) {
            this._append("DEBUG", message, callback);
        },

        /**
         * @function debug
         * 
         * Log specified message using `DEBUG` logging level.
         * 
         * Logs specified message using `DEBUG` logging level.
         * 
         * `String` messages are logged as-is, `Object`s are 
         * converted to JSON, stacktrace are extracted from specified `Error`s.
         * 
         * @param message `String|Object|Error` message to log
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        debug: function(message, callback) {
            this._append("DEBUG", message, callback);
        },

        /**
         * @function info
         * 
         * Log specified message using `INFO` logging level.
         * 
         * Logs specified message using `INFO` logging level.
         * 
         * `String` messages are logged as-is, `Object`s are 
         * converted to JSON, stacktrace are extracted from specified `Error`s.
         * 
         * @param message `String|Object|Error` message to log
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        info: function(message, callback) {
            this._append("INFO", message, callback);
        },

        /**
         * @function warn
         * 
         * Log specified message using `WARN` logging level.
         * 
         * Logs specified message using `WARN` logging level.
         * 
         * `String` messages are logged as-is, `Object`s are 
         * converted to JSON, stacktrace are extracted from specified `Error`s.
         * 
         * @param message `String|Object|Error` message to log
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        warn: function(message, callback) {
            this._append("WARN", message, callback);
        },
        
        /**
         * @function error
         * 
         * Log specified message using `ERROR` logging level.
         * 
         * Logs specified message using `ERROR` logging level.
         * 
         * `String` messages are logged as-is, `Object`s are 
         * converted to JSON, stacktrace are extracted from specified `Error`s.
         * 
         * @param message `String|Object|Error` message to log
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        error: function(message, callback) {
            this._append("ERROR", message, callback);
        },

        _append: function(level, message, callback) {
            try {
                var msg = "";
                if ("string" === typeof (message)) {
                    msg = message;
                } else if ("undefined" === typeof (message)) {
                    msg = "undefined";
                } else if (null === message) {
                    msg = "null";
                } else if (message instanceof Error) {
                    msg = utils.formatError(message);
                } else if ("object" === typeof (message) || message instanceof Array) {
                    try {
                        msg = JSON.stringify(message);
                    } catch (e) {
                        msg = utils.formatError(e);
                    }
                } else {
                    try {
                        msg = String(message);
                    } catch (e) {
                        msg = utils.formatError(e);
                    }
                }
                wiltoncall("logging_log", {
                    level: level,
                    logger: this.name,
                    message: msg
                });
                utils.callOrIgnore(callback, msg);
            } catch (e) {
                // do not throw by default
                if ("function" === typeof(callback)) {
                    callback(e);
                } else {
                    print("===LOGGER ERROR:");
                    print(utils.formatError(e));
                    print("===LOGGER ERROR END:");
                }
            }
        }
    };

    return Logger;

});
