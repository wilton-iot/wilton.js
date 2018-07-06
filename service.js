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
 * Serviceability operations.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // get pid of current process
 * var pid = getPid();
 * 
 * @endcode
 */
define([
    "./utils",
    "./wiltoncall"
], function(utils, wiltoncall) {
    "use strict";

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
            utils.callOrIgnore(callback, resnum);
            return resnum;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return {
        getPid: getPid
    };
});
