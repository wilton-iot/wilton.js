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
 * @namespace misc
 * 
 * __wilton/misc__ \n
 * Miscelanous functions.
 * 
 * This module provides miscelanous functionality that doesn't
 * belong to separate modules.
 */
define([
    "./utils",
    "./wiltoncall"
], function(utils, wiltoncall) {
    "use strict";

    /**
     * @function spawnProcess
     * 
     * Spawn new OS-level process.
     * 
     * Spawns an OS-level process launching specified executable
     * with the specified arguments.
     * 
     * Spawned process does not have `STDIN` connected.
     * `STDOUT` and `STDERR` are redirected to (the same) specified file.
     * 
     * If `awaitExit` flag is enabled - waits for the spawned process to
     * exit and returs its exit code.
     * 
     * Otherwise (default behaviour) returns immediately returning
     * a `pid` of the spawned process.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     * 
     * __Options__
     *  - __executable__ `String` path to the executable file
     *  - __args__ `Array` list of the arguments to provide to the executable
     *  - __outputFile__ `String` path to the file for the combined `STDOUT` and
     *                   `STDERR`output
     *  - __awaitExit__ `Boolean` whether to wait for the spawned process to exit,
     *                  `false` by default
     */
    function spawnProcess(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var res = wiltoncall("process_spawn", opts);
            utils.callOrIgnore(callback,res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    /**
     * @function wiltonConfig
     * 
     * Access `wilton` configuration.
     * 
     * Returns configuration object that was used for `wilton` initialization.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Object` configuration object with the following fields:
     * 
     * __defaultScriptEngine__ `String` name of the script engine that is used by default
     * __applicationDirectory__ `String` path to the application directory of the current process
     * __environmentVariables__ `Object` system environment variables collected during the startup
     * __requireJs__ `Object` `RequireJS` configuration
     */
    function wiltonConfig(callback) {
        try {
            var resstr = wiltoncall("get_wiltoncall_config");
            var res = JSON.parse(resstr);
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    /**
     * @function stdinReadline
     * 
     * Read a line from the `STDIN`.
     * 
     * Reads a line from the `STDIN` of the current process.
     * Blocks until the line is read.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `String` line passed to `STDIN`
     */
    function stdinReadline(callback) {
        try {
            var res = wiltoncall("stdin_readline");
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function waitForSignal
     * 
     * Wait for `Ctrl-C`.
     * 
     * Blocks curren thread untils `Ctrl-C` will be typed by used in console
     * (or `SIGINT` or `SIGTERM` signal will be received by other means).
     * 
     * This function is not intented to be used as a "general-use use signal handler".
     * 
     * It can be called only once is a single process, and is typically called from the main thread
     * of the console application after the initialization of background services.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     */
    function waitForSignal(callback) {
        try {
            wiltoncall("signal_await");
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    return {
        spawnProcess: spawnProcess,
        wiltonConfig: wiltonConfig,
        stdinReadline: stdinReadline,
        waitForSignal: waitForSignal
    };
});
