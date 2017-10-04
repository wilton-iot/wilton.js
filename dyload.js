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
 * @namespace dyload
 * 
 * __wilton/dyload__ \n
 * Load native shared library.
 * 
 * This module allows to load native shared libraries that
 * provide additional `wiltoncall` functions.
 * 
 * Library loading process is OS-specific. Function
 * `wilton_module_init` is called on the native library immediately after load.
 * This function must be available as a "public symbol" and should
 * use `wiltoncall_register` (`C` API) or `wilton::support::register_wiltoncall` (`C++` API)
 * to register native functions to be used from `JavaScript` through `wiltoncall` module.
 * 
 * If library with this name is already loaded in current process, this function will do nothing.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // load native lib from the current executable directory
 * // `libwilton_db.so` or `wilton_db.dll` will be loaded
 * // depending on platform
 * dyload({
 *     name: "wilton_db"
 * });
 * 
 * @endcode
 */
define([
    "./utils",
    "./wiltoncall"
], function(utils, wiltoncall) {
    "use strict";

    /**
     * @function dyload
     * 
     * Load native shared library.
     * 
     * Loads native shared library at the specified path and
     * calls `wilton_module_init` function on the loaded lib.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     * 
     * __Options__
     *  - __name__ `String` "logical" library name, will be converted to platform-specific 
     *             file name before load
     *  - __directory__ `String|Undefined` directory to load library from,
     *                  default value: current executable directory
     */
    function dyload(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            wiltoncall("dyload_shared_library", opts);
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return dyload;
});
