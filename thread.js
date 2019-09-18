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
 * @namespace thread
 * 
 * __wilton/thread__ \n
 * Run background threads.
 * 
 * This module allows to run specified function in the background OS-thread.
 * 
 * Different threads have separate JavaScript runtime contexts and
 * do not share JavaScript objects in memory. `wilton/Channel` or
 * `wilton/shared` modules may be used for inter-thread communication.
 * 
 * Started background threads are `daemon` (detached) and should be stopped
 * (e.g. using application level synchronization) before the application shutdown.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // runs specified function in background thread
 * thread.run({
 *     callbackScript: {
 *         module: "path/to/task/module",
 *         func: "taskFunction",
 *         args: ["foo", 42]
 *     }
 * });
 * 
 * // make current thread to sleep for some time
 * thread.sleepMillis(1000);
 * 
 * @endcode
 * 
 */
define([
    "./dyload",
    "./misc",
    "./wiltoncall",
    "./utils"
], function(dyload, misc, wiltoncall, utils) {
    "use strict";

    dyload({
        name: "wilton_thread"
    });

    /**
     * @function run
     * 
     * Start specified function in the background thread.
     * 
     * Starts the new OS-thread and runs specified function 
     * (found inside the specified module) in this thread.
     * 
     * This function returns immediately.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     * 
     * __Options__
     *  - __callbackScript__ `Object` module path and function name to run from background thread
     *    - __module__ `String` full name of JavaScript module to load
     *    - __func__ `String|Undefined` name of the function contained in the specified module,
     *               if function is not specified, only module will be loaded
     *               (its top-level code will be executed)
     *    - __args__ `Array|Undefined` optional list of arguments, that will be passed to specified function
     *  - __capabilities__ `Array|Undefined` list of the `wiltoncall` calls names allowed to
     *                     be used from the spawned thread; if this parameter is not specified,
     *                     then capabilities checks are not performed for the spawned thread
     */
    function run(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            if (misc.isAndroid() &&
                    ("rhino" === misc.wiltonConfig().defaultScriptEngine &&
                    "undefined" === typeof(opts.callbackScript.engine)) ||
                    "rhino" === opts.callbackScript.engine) {
                // rhino thread on Android won't fit into std::thread stack size
                var Runnable = Packages.java.lang.Runnable;
                var Thread = Packages.java.lang.Thread;
                var ThreadGroup = Packages.java.lang.ThreadGroup;
                new Thread(new ThreadGroup("rhino"), new Runnable(function() {
                    wiltoncall("runscript_rhino", opts.callbackScript);
                }), "rhino-thread", 1024 * 1024 * 16).start();
            } else {
                utils.checkProperties(opts, ["callbackScript"]);
                wiltoncall("thread_run", opts); 
            }
            return utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function sleepMillis
     * 
     * Stops the execution of the current thread for the specified time period.
     * 
     * Maked current thread to sleep for specified amount of milliseconds.
     * 
     * @param millis `Number` amount of milliseconds to sleep
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     */
    function sleepMillis(millis, callback) {
        try {
            wiltoncall("thread_sleep_millis", {
                millis: millis
            });
            return utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    return {
        run: run,
        sleepMillis: sleepMillis
    };
});
