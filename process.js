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
 * @namespace process
 * 
 * __wilton/process__ \n
 * OS process operations.
 * 
 * This module currently provides only one function: `spawn()` .
 * 
 * Usage example:
 * 
 * @code
 * 
 * // spawn new process in background and return its pid
 * var pid = misc.spawnProcess({
 *     executable: path/to/executable
 *     args: ["foo", "bar"], 
 *     outputFile: path/to/out/file,
 *     awaitExit: false
 * });
 * 
 * // spawn new process, wait for it to exit, return exit code
 * var code = misc.spawnProcess({
 *     executable: path/to/executable
 *     args: ["foo", "bar"], 
 *     outputFile: path/to/out/file,
 *     awaitExit: true
 * });
 * 
 * @endcode
 */
define([
    "./dyload",
    "./utils",
    "./wiltoncall"
], function(dyload, utils, wiltoncall) {
    "use strict";

    dyload({
        name: "wilton_process"
    });

    /**
     * @function spawn
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
     * @return `Number` `pid` of started process or its exit code, if `awaitExit` is used
     * 
     * __Options__
     *  - __executable__ `String` path to the executable file
     *  - __args__ `Array` list of the arguments to provide to the executable
     *  - __outputFile__ `String` path to the file for the combined `STDOUT` and
     *                   `STDERR`output
     *  - __awaitExit__ `Boolean` whether to wait for the spawned process to exit,
     *                  `false` by default
     */
    function spawn(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var res = wiltoncall("process_spawn", opts);
            var resnum = parseInt(res, 10);
            utils.callOrIgnore(callback, resnum);
            return resnum;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return {
        spawn: spawn
    };
});
