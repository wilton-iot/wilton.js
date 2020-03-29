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
 * var pid = process.spawn({
 *     executable: path/to/executable,
 *     args: ["foo", "bar"], 
 *     outputFile: path/to/out/file,
 *     awaitExit: false
 * });
 * 
 * // spawn new process, wait for it to exit, return exit code
 * var code = process.spawn({
 *     executable: path/to/executable,
 *     args: ["foo", "bar"], 
 *     outputFile: path/to/out/file,
 *     awaitExit: true
 * });
 * 
 * // get pid of the current process
 * var pid = process.currentPid();
 * 
 * // kill process by pid
 * process.killByPid(pid);
 * 
 * @endcode
 */
define([
    "./dyload",
    "./misc",
    "./utils",
    "./wiltoncall"
], function(dyload, misc, utils, wiltoncall) {
    "use strict";

    if (!misc.isAndroid()) {
        dyload({
            name: "wilton_process"
        });
    }

    function findStartupModule(args) {
        if ("undefined" === typeof(args) || 
                null === args ||
                !(args instanceof Array)) {
            throw new Error("Invalid process arguments specified: [" + args + "]");
        }
        for (var i = 0; i < args.length; i++) {
            var ar = args[i];
            if (utils.endsWith(ar, ".js")) {
                var modfile = ar.replace(/^.*(\/|\\)/, "");
                var modname = modfile.replace(/\.js$/, "");
                return modname;
            }
        }
        throw new Error("Startup script not found, args: [" + JSON.stringify(args, null, 4) + "]");
    }

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
     * @return `Number` PID of started process or its exit code, if `awaitExit` is used
     * 
     * __Options__
     *  - __executable__ `String` path to the executable file
     *  - __args__ `Array` list of the arguments to provide to the executable
     *  - __outputFile__ `String` path to the file for the combined `STDOUT` and
     *                   `STDERR`output
     *  - __directory__ `String|Undefined` path to the working directory for the process,
     *                  default value: the same working directory as parent process
     *  - __awaitExit__ `Boolean` whether to wait for the spawned process to exit,
     *                  `false` by default
     */
    function spawn(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            if (!misc.isAndroid()) {
                var res = wiltoncall("process_spawn", opts);
                var resnum = parseInt(res, 10);
                return utils.callOrIgnore(callback, resnum);
            } else { // spawn wilton process
                var runOnRhino = WILTON_requiresync("wilton/android/runOnRhino");
                var repoPath = null;
                var rootModuleName = null;
                var startupModule = null;
                // only single element in paths is expected
                var paths = misc.wiltonConfig().requireJs.paths;
                for (var key in paths) {
                    repoPath = paths[key].replace(/^file:\/\//, "");
                    rootModuleName = key;
                    startupModule = rootModuleName + "/" + findStartupModule(opts.args);
                    break;
                }
                runOnRhino({
                    module: "wilton/android/startDeviceService",
                    args: [repoPath, rootModuleName, startupModule]
                });
                return utils.callOrIgnore(callback, 1);
            }
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function spawnShell
     * 
     * Spawn new OS-level shell process.
     * 
     * Spawns an OS-level shell process launching OS-specific
     * shell processor and waits for it to exit.
     * 
     * Note: use `spawn` instead of `spawnShell` whether possible.
     * 
     * @param commands `Array` list of commands to pass to OS shell processor
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Number` OS-specific output code
     * 
     */
    function spawnShell(commands, callback) {
        try {
            if (utils.undefinedOrNull(commands) || !(commands instanceof Array)) {
                throw new Error("Invalid 'commands' array specified");
            }
            var cmd = commands.join(" ");
            var res = wiltoncall("process_spawn_shell", {
                command: cmd
            });
            var resnum = parseInt(res, 10);
            return utils.callOrIgnore(callback, resnum);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function currentPid
     * 
     * Return the PID of the current process.
     * 
     * Returns the PID of the current process. Not supported on Android.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Number` PID of the current process
     */
    function currentPid(callback) {
        try {
            var json = wiltoncall("process_current_pid");
            var obj = JSON.parse(json);
            var res = obj.pid;
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function killByPid
     * 
     * Kill the process with the specified PID.
     * 
     * Teminates the process with the specified PID. Target process cannot
     * prevent its termination. Not supported on Android.
     * 
     * @param pid `Number` PID of the process to terminate
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` Empty string on successfull termination, error message otherwise.
     */
    function killByPid(pid, callback) {
        try {
            var err = wiltoncall("process_kill_by_pid", {
                pid: pid
            });
            return utils.callOrIgnore(callback, err);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    return {
        spawn: spawn,
        spawnShell: spawnShell,
        currentPid: currentPid,
        killByPid: killByPid
    };
});
