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
    "./dyload",
    "./utils",
    "./wiltoncall"
], function(dyload, utils, wiltoncall) {
    "use strict";

    if (isAndroid()) {
        dyload({
            name: "wilton_channel"
        });
    } else {
        dyload({
            name: "wilton_signal"
        });
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
     * - __defaultScriptEngine__ `String` name of the script engine that is used by default
     * - __wiltonHome__ `String` path to the Wilton directory
     * - __environmentVariables__ `Object` system environment variables collected during the startup
     * - __requireJs__ `Object` `RequireJS` configuration
     */
    function wiltonConfig(callback) {
        try {
            var resstr = wiltoncall("get_wiltoncall_config");
            var res = JSON.parse(resstr);
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
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
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function listRegisteredCalls
     * 
     * Return a list of registered Wilton calls
     * 
     * Returns a list of call names, that can be used with
     * `wiltoncall` function.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Array` list of registered Wilton calls
     */
    function listRegisteredCalls(callback) {
        try {
            var resJson = wiltoncall("wiltoncall_list_registered");
            var res = JSON.parse(resJson);
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
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
            if (isAndroid()) {
                var Channel = WILTON_requiresync("wilton/Channel");
                Channel.lookup("signal").receive();
            } else {
                wiltoncall("signal_await");
            }
            return utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function runGC
     * 
     * Run a garbage collector
     * 
     * Runs a garbage collector for the default JS engine in a current thread.
     * Actual GC run may or may not be async from this call depending on
     * an engine. For JSC engine different versions may behave differently in that regard.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     */
    function runGC(callback) {
        try {
            var callname = "rungc_" + wiltonConfig().defaultScriptEngine;
            wiltoncall(callname);
            return utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    function _isCompileTimeOS(name, callback) {
        try {
            var conf = wiltonConfig();
            var res = name === conf.compileTimeOS;
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function isAndroid
     * 
     * Check whether current Wilton binary was compiled for Android
     * 
     * Checks that `compileTimeOS` parameter of `wiltonConfig` is "android".
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Boolean` `true` if current Wilton binary was compiled for Android, false otherwise
     */
    function isAndroid(callback) {
        return _isCompileTimeOS("android", callback);
    }

    /**
     * @function isWindows
     * 
     * Check whether current Wilton binary was compiled for Windows
     * 
     * Checks that `compileTimeOS` parameter of `wiltonConfig` is "windows".
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Boolean` `true` if current Wilton binary was compiled for Windows, false otherwise
     */
    function isWindows(callback) {
        return _isCompileTimeOS("windows", callback);
    }

    /**
     * @function isLinux
     * 
     * Check whether current Wilton binary was compiled for Linux
     * 
     * Checks that `compileTimeOS` parameter of `wiltonConfig` is "linux".
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Boolean` `true` if current Wilton binary was compiled for Linux, false otherwise
     */
    function isLinux(callback) {
        return _isCompileTimeOS("linux", callback);
    }

    /**
     * @function isMac
     * 
     * Check whether current Wilton binary was compiled for macOS 
     * 
     * Checks that `compileTimeOS` parameter of `wiltonConfig` is "macos".
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Boolean` `true` if current Wilton binary was compiled for macOS, false otherwise
     */
    function isMac(callback) {
        return _isCompileTimeOS("macos", callback);
    }

    /**
     * @function systemdNotify
     * 
     * Notify systemd service manager
     * 
     * Sends message to systemd service manager using `sd_notify` API,
     * see: https://www.freedesktop.org/software/systemd/man/sd_notify.html
     * 
     * @param state `String` message to send to systemd
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     */
    function systemdNotify(state, callback) {
        dyload({
            name: "wilton_systemd"
        });
        try {
            wiltoncall("systemd_notify", {
                state: state
            });
            return utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function winscmStartDispatcher
     * 
     * Connect the main thread of a wilton process to SCM.
     * 
     * Connects the main thread of a wilton process to the Windos Service Control Manager.
     * Call return after the SCM service is stopped.
     * 
     * @param name `String` name of the SCM service
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     */
    function winscmStartDispatcher(name, callback) {
        dyload({
            name: "wilton_winscm"
        });
        try {
            wiltoncall("winscm_start_service_control_dispatcher", {
                name: name
            });
            return utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    return {
        wiltonConfig: wiltonConfig,
        stdinReadline: stdinReadline,
        listRegisteredCalls: listRegisteredCalls,
        waitForSignal: waitForSignal,
        runGC: runGC,
        isAndroid: isAndroid,
        isWindows: isWindows,
        isLinux: isLinux,
        isMac: isMac,
        systemdNotify: systemdNotify,
        winscmStartDispatcher: winscmStartDispatcher
    };
});
