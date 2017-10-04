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
 * @namespace wiltoncall
 * 
 * __wilton/wiltoncall__ \n
 * Call native function.
 * 
 * This module allows to call native functions, that were
 * added to "wiltoncall registry" using `wiltoncall_register` (`C` API)
 * or `wilton::support::register_wiltoncall` (`C++` API).
 * 
 * All interaction from `wilton.js` to the native code it done through this module.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // read file contents using "wiltoncall" directly
 * // the same can be done using "wilton/fs"
 * var contents = wiltoncall("fs_read_file", {
 *     path: "path/to/file.txt"
 * });
 * 
 * @endcode
 */
define(["./utils"], function(utils) {
    "use strict";
    
    /**
     * @function wiltoncall
     * 
     * @param name `String` name that was used to register native function at wilton registry
     * @param data `String|Object|Undefined` input data for native function
     * @returns `String` output of the native function
     */
    return function(name, data) {
        if ("string" !== typeof (name) || !(name.length > 0)) {
            throw new Error("Invalid 'wiltoncall' parameters specified, name: [" + name + "]");
        }
        var json = utils.defaultJson(data);
        return WILTON_wiltoncall(name, json);
    };
});
