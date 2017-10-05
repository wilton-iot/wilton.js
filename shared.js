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
 * @namespace shared
 * 
 * __wilton/shared__ \n
 * Share data between multiple threads.
 * 
 * This module allows to store JSON data in shared memory.
 * Stored values can be accessed from multiple threads.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // store object as JSON
 * shared.put("key1", {
 *     foo: "bar"
 *     baz: 42
 * });
 * 
 * // load object, throws Error if key not found
 * shared.get("key1");
 * 
 * // wait this thread until stored value will be changed
 * shared.waitChange({
 *     timeoutMillis: 15000,
 *     key: "key2",
 *     currentValue: {
 *         foo: "bar"
 *     }
 * });
 * 
 * // remove shared entry
 * shared.remove("key");
 * 
 * // dump the whole shared regsistr as string
 * var dumped = shared.dump();
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
        name: "wilton_shared"
    });

    /**
     * @function put
     * 
     * Store JSON object in shared memory.
     * 
     * Stores specified object as JSON in shared memory,
     * where it can be accessed from other threads.
     * 
     * @param key `String` key for stored value
     * @param value `Object|String` object to store as JSON
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Object` previous value stored under the same key, or `null` if key doesn't exist
     */
    function put(key, value, callback) {
        try {
            var val = utils.defaultJson(value);
            var res = wiltoncall("shared_put", {
                key: key,
                value: val
            });
            var resout = null !== res ? JSON.parse(res) : null;
            utils.callOrIgnore(callback, resout);
            return resout;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    /**
     * @function get
     * 
     * Get JSON object from shared memory.
     * 
     * Loads the shared JSON object that was previously stored in shared memory
     * under the specified key.
     * 
     * Throws `Error` if key not found.
     * 
     * @param key `String` key for stored value
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Object` stored value parsed as JSON; throws `Error` if key not found
     */
    function get(key, callback) {
        try {
            var res = wiltoncall("shared_get", {
                key: key
            });
            if (null !== res) {
                var resout = JSON.parse(res);
                utils.callOrIgnore(callback, resout);
                return resout;
            }
            throw new Error("Shared entry not found for key: [" + key + "]");
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    /**
     * @function waitChange
     * 
     * Wait until shared value changed in other thread.
     * 
     * _Note_: `wilton/Channel` module can be used for inter thread synchronization
     * instead of this call.
     * 
     * Makes current thread to wait on the shared value with a specified key
     * until this value will be changed in other thread.
     * 
     * Returns immediately if specified `currentValue`
     * does not equal the stored value.
     * 
     * Throws `Error` if specified key not found.
     * 
     * Throws `Error` on timeout.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Object` value changed from other thread
     * 
     * __Options__
     *  - __timeoutMillis__ `Number` max time to wait for the value change, in milliseconds
     *  - __key__ `String` key for the shared entry to wait on
     *  - __currentValue__ `Object|String` existing expected value of the shared entry
     */
    function waitChange(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            utils.checkProperties(opts, ["timeoutMillis", "key", "currentValue"]);
            var cval = utils.defaultJson(opts.currentValue);
            var res = wiltoncall("shared_wait_change", {
                timeoutMillis: opts.timeoutMillis,
                key: opts.key,
                currentValue: cval
            });
            var resout = null !== res ? JSON.parse(res) : null;
            utils.callOrIgnore(callback, resout);
            return resout;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    /**
     * @function remove
     * 
     * Remove shared memory entry.
     * 
     * Removes shared memory entry with the specified key and returns its value.
     * 
     * @param key `String` shared memory entry key
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Object` stored value parsed as JSON; `null` if key not found
     */
    function remove(key, callback) {
        try {
            var res = wiltoncall("shared_remove", {
                key: key
            });
            var resout = null !== res ? JSON.parse(res) : null;
            utils.callOrIgnore(callback, resout);
            return resout;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    /**
     * @function dump
     * 
     * Dump current state of the shared memory registry.
     * 
     * Dumps current state of the whole shared registry and returns
     * it as a string.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `String` shared registry dump
     */
    function dump(callback) {
        try {
            return wiltoncall("shared_dump");
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    return {
        put: put,
        get: get,
        waitChange: waitChange,
        remove: remove,
        dump: dump
    };

});
