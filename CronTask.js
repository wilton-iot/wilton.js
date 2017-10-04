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
 * @namespace CronTask
 * 
 * __wilton/CronTask__ \n
 * Run periodic tasks in background.
 * 
 * This module allows to run tasks in background, starting them periodically
 * specifying startup times using [Cron expression](https://en.wikipedia.org/wiki/Cron#Overview).
 * 
 * It uses extended version of `Cron` expressions with support for seconds field.
 * 
 * Each `CronTask` instance starts a background thread that is used to run specified function.
 * 
 * To release system resources, `CronTask` instance can be stopped manually using `stop()`
 * method, or it will be closed during the shutdown.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // create instance, this starts background thread 
 * var cron = new CronTask({
 *     expression: "0 0 7 ? * MON-FRI",
 *     callbackScript: {
 *         module: "path/to/task/module",
 *         func: "taskFunction",
 *         args: ["foo", 42]
 *     }
 * });
 * 
 * // task is running in background periodically now
 * 
 * // stop task
 * cron.stop();
 * 
 * @endcode
 * 
 */
define([
    "./dyload",
    "./wiltoncall",
    "./utils"
], function(dyload, wiltoncall, utils) {
    "use strict";

    dyload({
        name: "wilton_cron"
    });

    /**
     * @function CronTask
     * 
     * Create `CronTask` instance.
     * 
     * Creates task instance and starts background thread.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` `CronTask` instance
     * 
     * __Options__
     *  - __expression__ `String` Cron expression, see [expression format](https://en.wikipedia.org/wiki/Cron#Overview)
     *  - __callbackScript__ `Object` module path and function name to run from background thread
     *    - __module__ `String` full name of JavaScript module to load
     *    - __func__ `String|Undefined` name of the function contained in specified module,
     *               if function is not specified, only module will be loaded
     *               (its top-level code will be executed)
     *    - __args__ `Array|Undefined` optional list of arguments, that will be passed to specified function
     */
    function CronTask(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            if (utils.hasPropertyWithType(opts, "handle", "number")) {
                this.handle = opts.handle;
            } else {
                utils.checkProperties(opts, ["expression", "callbackScript"]);
                var handleJson = wiltoncall("cron_start", {
                    expression: opts.expression,
                    callbackScript: opts.callbackScript
                });
                var handleObj = JSON.parse(handleJson);
                utils.checkPropertyType(handleObj, "cronHandle", "number");
                this.handle = handleObj.cronHandle;
            }
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    CronTask.prototype = {
        /**
         * @function stop
         * 
         * Stop periodic execution of a background task.
         * 
         * Stops the background thread releasing system resources.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        stop: function(callback) {
            try {
                wiltoncall("cron_stop", {
                    cronHandle: this.handle
                });
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }
    };

    return CronTask;
});
