/*
 * Copyright 2019, alex at staticlibs.net
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
 * @namespace KVStore
 * 
 * __wilton/KVStore__ \n
 * Key-value store.
 * 
 * Key-value store (linked hash multimap) that lives in shared memory and can be safely
 * accessed from multiple threads.
 * 
 * Can be optionally created over the persistent file on disk. In that case file
 * contents are read on store creation and saved on store destroy
 * (for example, on application shutdown) or on a `persist()` call.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // create transient (non-persistent store)
 * var st1 = new KVStore();
 * 
 * // create persistent store over a file
 * var st = new KVStore("path/to/my.json");
 * 
 * // put entries into store
 * st.put("foo", "bar");
 * st.put("baz": [42, 43]);
 * 
 * // append values to existing entry
 * // existing value must be an array
 * st.append("baz", [44, 45, 46];
 * 
 * // remove entry
 * st.remove("foo");
 * 
 * // share store with other threads
 * var chan = new Channel("my/channel/name", 1);
 * chan.send({
 *     kvstoreHandle: st.handle
 * });
 * 
 * // access store from other thread
 * var channel = Channel.lookup("my/channel/name");
 * var handle = channel.peek().kvstoreHandle;
 * var st = new KVStore(handle);
 * 
 * // persist store to file
 * st.persist();
 * 
 * // destroy store, persisting it to file
 * // and de-allocating native resources
 * st.destroy()
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
        name: "wilton_kvstore"
    });

    /**
     * @function KVStore
     * 
     * Create `KVStore` instance.
     * 
     * Create a store instance allocating the native resources for it.
     * If path to file is specified, entries from this file will be
     * be loaded into store and this file will be used to persist the contents of the store.
     * 
     * If empty (or `null`) file path specified - store will be memory-only without
     * dist persistence.
     * 
     * If handle value is specified - uses existing store with this handle.
     * 
     * @param filePathOrHandle `String|Undefined|Number` this argument represents either
     *        a path to the file (`String`) where to persist store contents;
     *        or a handle (`Number`) of the existing `KVStore` object created
     *        in another thread; if argument is `null` ot not specified
     *        persistence is not used
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` `KVStore` instance
     * 
     */
    function KVStore(filePathOrHandle, callback) {
        try {
            if ("number" === typeof(filePathOrHandle)) {
                this.handle = filePathOrHandle;
            } else {
                var path = "undefined" !== typeof(filePathOrHandle) ? filePathOrHandle : "";
                var handleJson = wiltoncall("kvstore_create", {
                    filePath: path
                });
                var handleObj = JSON.parse(handleJson);
                utils.checkPropertyType(handleObj, "kvstoreHandle", "number");
                this.handle = handleObj.kvstoreHandle;
            }
            utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    KVStore.prototype = {

        /**
         * @function get
         * 
         * Get an element from the store.
         * 
         * Retrieves an element from the store with the specified key.
         * Returns `null` if specified key is not found.
         * 
         * @param key `String` key to retrieve
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Any` stored value (`Object` or `Array`) or
         *         `null` if no key was found
         */
        get: function(key, callback) {
            try {
                var resStr = wiltoncall("kvstore_get", {
                    kvstoreHandle: this.handle,
                    key: key
                });
                var res = null !== resStr ? JSON.parse(resStr) : null;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function getBatch
         * 
         * Get multiple elements from the store.
         * 
         * Retrieves multiple elements from the store using
         * specified `keyList`. Returning object contains only the
         * keys (and retrieved values) that were found in the store.
         * Keys, that were not found, are not included into result.
         * 
         * @param keyList `Array` list of keys to retrieve
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Object` objects with each property containing a key from the
         *          specified list and a retrieved value for that key - `Object` or `Array`
         */
        getBatch: function(keyList, callback) {
            try {
                var resStr = wiltoncall("kvstore_get_batch", {
                    kvstoreHandle: this.handle,
                    keyList: keyList
                });
                var res = null !== resStr ? JSON.parse(resStr) : null;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function put
         * 
         * Put an element to the store.
         * 
         * Inserts the specified value into the store using the specified key.
         * If key already exist in the store, its value it overwritten.
         * 
         * @param key `String` key to insert
         * @param value `Object|Array` value to insert
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Any` value (`Object` or `Array`) that was
         *          stored with the specified key or `null` if no existing key was found
         */
        put: function(key, value, callback) {
            try {
                var resStr = wiltoncall("kvstore_put", {
                    kvstoreHandle: this.handle,
                    key: key,
                    value: value
                });
                var res = null !== resStr ? JSON.parse(resStr) : null;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function putBatch
         * 
         * Put multiple elements to the store.
         * 
         * Inserts all properties from the specified `Object` into the store.
         * If the store already contains some of the inserted keys, their values
         * are overwritten.
         * 
         * @param obj `Object` object containing the set of elements to insert,
         *            each property value must be either `Object` or `Array`
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Object` object containing entries with the matching keys
         *          that were overwritten by the insertion; entries that were
         *          not overwritten are not included
         */
        putBatch: function(obj, callback) {
            try {
                var resStr = wiltoncall("kvstore_put_batch", {
                    kvstoreHandle: this.handle,
                    object: obj
                });
                var res = JSON.parse(resStr);
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function append
         * 
         * Append values to the list for the specified key.
         * 
         * Extends the array, stored as a value for the specified key, with the
         * specified list of values (appending each value to the end of the array).
         * 
         * If key doesn't exist in the store - it is created with the specified values list.
         * 
         * If key exists in the store, its value must be an `Array`.
         * 
         * @param key `String` key of the entry to append to, its already inserted
         *            value must be a JSON `Array`
         * @param values `Array` list of values to append to the existing list
         *               already stored for the specified key
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Boolean` `true`, if the key existed and its value (JSON `Array`) was
         *          actually appended to; false if key didn't exist and was created
         *          with the specified `values` list
         */
        append: function(key, values, callback) {
            try {
                var resStr = wiltoncall("kvstore_append", {
                    kvstoreHandle: this.handle,
                    key: key,
                    values: values
                });
                var resObj = JSON.parse(resStr);
                utils.checkPropertyType(resObj, "keyExisted", "boolean");
                var res = resObj.keyExisted;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function remove
         * 
         * Remove an element from the store.
         * 
         * Removes the element with the specified key from the store.
         * 
         * @param key `String` key to remove
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Boolean` `true` if the specified key was found (and the corresponding
         *          entry was removed), `false` otherwise
         */
        remove: function(key, callback) {
            try {
                var resStr = wiltoncall("kvstore_remove", {
                    kvstoreHandle: this.handle,
                    key: key
                });
                var resObj = JSON.parse(resStr);
                utils.checkPropertyType(resObj, "keyExisted", "boolean");
                var res = resObj.keyExisted;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function removeBatch
         * 
         * Remove multiple elements from the store.
         * 
         * Remove the elemtns with the specified keys from the store.
         * 
         * @param keyList `Array` list of keys to remove
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Array` list of the keys, that were found in the store
         *         and removed
         */
        removeBatch: function(keyList, callback) {
            try {
                var resStr = wiltoncall("kvstore_remove_batch", {
                    kvstoreHandle: this.handle,
                    keyList: keyList
                });
                var res = JSON.parse(resStr);
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function size
         * 
         * Number of entries in this store.
         * 
         * Returns the number of entries in this store.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Number` number of entries in the store
         */
        size: function(callback) {
            try {
                var resStr = wiltoncall("kvstore_size", {
                    kvstoreHandle: this.handle
                });
                var resObj = JSON.parse(resStr);
                utils.checkPropertyType(resObj, "size", "number");
                var res = resObj.size;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function keys
         * 
         * All the keys from this store.
         * 
         * Returns an `Array` containing all the keys from this store.
         * Keys are returned in the insertion order.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Array` list of all the keys in the store
         */
        keys: function(callback) {
            try {
                var resStr = wiltoncall("kvstore_keys", {
                    kvstoreHandle: this.handle
                });
                var res = JSON.parse(resStr);
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function entries
         * 
         * All the entries from this store.
         * 
         * Returns an `Object` containing all the entries from the store.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Object` all the contents of the store
         */
        entries: function(callback) {
            try {
                var resStr = wiltoncall("kvstore_entries", {
                    kvstoreHandle: this.handle
                });
                var res = JSON.parse(resStr);
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function persist
         * 
         * Save all contents to file.
         * 
         * Saves all the contents of the store to the file on disk.
         * Throws an error, if no file path was specified on store creation.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Number` number of elements saved to JSON file
         */
        persist: function(callback) {
            try {
                var resStr = wiltoncall("kvstore_persist", {
                    kvstoreHandle: this.handle
                });
                var resObj = JSON.parse(resStr);
                utils.checkPropertyType(resObj, "persistedCount", "number");
                var res = resObj.persistedCount;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function clear
         * 
         * Delete all stored entries.
         * 
         * Removes all elements from the store and (if this store was constructed over a file)
         * overwrites the persistent file with empty contents.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Number` number of entries removed
         */
        clear: function(callback) {
            try {
                var resStr = wiltoncall("kvstore_clear", {
                    kvstoreHandle: this.handle
                });
                var resObj = JSON.parse(resStr);
                utils.checkPropertyType(resObj, "removedCount", "number");
                var res = resObj.removedCount;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function destroy
         * 
         * Deallocate native resources used for this store.
         * 
         * Saves store contents to a file (if this store was constructed over a file)
         * and destroys the store de-allocating the native resources associates with it.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Number` number of elements in store before destroy
         */
        destroy: function(callback) {
            try {
                wiltoncall("kvstore_destroy", {
                    kvstoreHandle: this.handle
                });
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        }

    };

    return KVStore;
});