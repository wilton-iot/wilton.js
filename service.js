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
 * @namespace service
 * 
 * __wilton/service__ \n
 * Serviceability functions.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // get pid of current process
 * var pid = getPid();
 * 
 * // get memorySize of current process in bytes
 * var memory = getMemorySize();
 * 
 * @endcode
 */
define([
    "./utils",
    "./wiltoncall",
    "./dyload",
    "./misc",
    "./fs"
], function(utils, wiltoncall, dyload, misc, fs) {
    "use strict";

    dyload({
        name: "wilton_service"
    });

    /**
     * @function isTraceOn
     * 
     * Check if trace is recording.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Boolean` true if trace recording is on, false otherwise
     */

    function isTraceOn(callback){
        try {
            var res = parseInt(wiltoncall("service_is_trace_info_gather_enabled"));
            var res = parseInt(res) === 1;
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function traceTurnOff
     * 
     * Turn off trace recording.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     */

    function traceTurnOff(callback){
        try {
            wiltoncall("service_disable_trace_info_gather");
            return utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function traceTurnOff
     * 
     * Turn on trace recording.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     */

    function traceTurnOn(callback){
        try {
            wiltoncall("service_enable_trace_info_gather");
            return utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function getCurrentCallStack
     * 
     * Returns string with current callstack.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` with current callstack
     */

    function getCurrentCallStack(callback){
        try {
            var res = wiltoncall("service_get_call_stack");
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function getAllCalls
     * 
     * Returns string with all function calls on current moment.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` with all function calls
     */

    function getAllCalls(callback){
        try {
            var res = wiltoncall("service_get_all_calls");
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function getThreadsCount
     * 
     * Returns quantity of threads in current process.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Number` qty of threads
     */

    function getThreadsCount(callback){
        try {
            var res = parseInt(wiltoncall("service_get_threads_count"));
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }
    /**
     * @function getPid
     * 
     * Get pid of current process.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Number` `pid` of current process or 0, if can't get pid
     */
    function getPid(callback) {
        try {
            var res = wiltoncall("service_get_pid");
            var resnum = (res === "") ? 0 : parseInt(res);
            return utils.callOrIgnore(callback, resnum);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function getMemorySize
     * 
     * Get memorySize of current process in bytes.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Number` memorySize of current process
     */
    function getMemorySize(callback) {
        try {
            if (misc.isLinux()) {
                //it's Linux, so parse /proc/pid/status
                var pid = getPid();
                var status = fs.readFile("/proc/" + pid + "/status");
                var regexp = /(VmRSS:).+(\n)/i;
                resnum = parseInt(regexp.exec(status)[0].match(/\d+/i)) * 1024;
            } else {
                var res = wiltoncall("service_get_process_memory_size_bytes"), resnum;
                resnum = parseInt(res);
            }
            return utils.callOrIgnore(callback, resnum);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    return {
        getPid: getPid,
        getMemorySize: getMemorySize,
        isTraceOn: isTraceOn,
        traceTurnOff: traceTurnOff,
        traceTurnOn: traceTurnOn,
        getCurrentCallStack: getCurrentCallStack,
        getAllCalls: getAllCalls,
        getThreadsCount: getThreadsCount
    };
});
