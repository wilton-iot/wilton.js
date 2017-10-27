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
 * @namespace Channel
 * 
 * __wilton/Channel__ \n
 * Pipes that connect concurrent threads.
 * 
 * This module provides "pipes" - FIFO queues - that can be used to transfer data between
 * differrent threads of execution. Data is transfered in JSON format.
 * 
 * Data can be send and received in blocking (`send()` and `receive()` methods) 
 * or non-blocking (`offer()` and `poll()` methods) modes.
 * 
 * Multiple threads can write to and read from the same `Channel`
 * at the same time.
 * 
 * `Channel`s can be "bufferred" (with some amount of intemediate storage),
 * or synchronous (without intermediate storage). Only blocking methods can be used on synchronous
 * channels.
 * 
 * Readers can wait for the data on multiple channels simultaneously using 
 * `select()` function.
 * 
 * `Channel`s are similar in nature with [golang Channels](https://tour.golang.org/concurrency/2).
 * 
 * Underlying system resources can be released manually using `close()` method,
 * open channels will be closed during the shutdown.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // thread 1
 * 
 * // create buffered channel
 * var chan = new Channel("channel1", 1024);
 * 
 * // create sync channel
 * var sync = new Channel("channel2");
 * 
 * // send message, blocks is channel is full
 * chan.send({
 *     foo: 42
 * });
 * 
 * // offer message, returns false if channel is full
 * chan.offer({
 *     bar: 43
 * });
 * 
 * 
 * // thread 2
 * 
 * // lookup existing channels from other thread
 * var chan = Channel.lookup("channel1");
 * var sync = Channel.lookup("channel2");
 * 
 * // receive message, blocks if channel is empty
 * var obj1 = chan.receive();
 * 
 * // poll for message, returns null if channel is empty
 * var obj2 = chan.poll();
 * 
 * // copy pending message without removing it from channel
 * var obj3 = chan.peek();
 * 
 * // wait on multiple channels, returns the index of channel that has data ready
 *  var idx = Channel.select([chan, sync], 10000);
 * 
 * // close channels
 * chan.close();
 * sync.close();
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
        name: "wilton_channel"
    });

    /**
     * @function Channel
     * 
     * Create `Channel`instance.
     * 
     * Creates channel instance allocating resources for intermediate storage.
     * If `size` parameter is not specified - created synchronous channel.
     * 
     * Created channel can be accessed in other threads using `lookup()` function.
     * 
     * @param name `String` unique name to identify this channel
     * @param size `Number|Undefined` maximum number of elements allowed for the intermediate storage;
     *             storage is not pre-allocated, grows until this number as needed;
     *             value `0` creates synchronous channel, default value: `0`
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` `Channel` instance
     * 
     */
    function Channel(name, size, callback) {
        try {
            if ("number" === typeof(name)) {
                this.handle = name;
            } else {
                var handleJson = wiltoncall("channel_create", {
                    name: name,
                    size: "undefined" !== typeof(size) ? size : 0
                });
                var handleObj = JSON.parse(handleJson);
                utils.checkPropertyType(handleObj, "channelHandle", "number");
                this.handle = handleObj.channelHandle;
            }
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @static lookup
     * 
     * Look for the existing channel.
     * 
     * Look for the existing channel that may be created in this or other thread.
     * 
     * Returned channel instance is different from the original one
     * (as different threads cannot share live JavaScript objects),
     * but is linked (through `handle`) to the same native instance 
     * (that holds intermediate storage for this channel).
     * 
     * @param name `String` channel name
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` `Channel` instance that corresponds to native channel with
     *         a specified name; throws `Error` if channel not found
     * 
     */
    Channel.lookup = function(name, callback) {
        try {
            var handleJson = wiltoncall("channel_lookup", {
                name: name
            });
            var handleObj = JSON.parse(handleJson);
            utils.checkPropertyType(handleObj, "channelHandle", "number");
            var res = new Channel(handleObj.channelHandle);
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };
    
    /**
     * @static select
     * 
     * Wait for input data on multiple channels simultaneously.
     * 
     * Blocks current thread until one of the specified channels won't become
     * ready for reading data from it.
     * 
     * This function is similar in nature to [POSIX select](http://pubs.opengroup.org/onlinepubs/009695399/functions/pselect.html)
     * and [golang's select](https://gobyexample.com/select),
     * but it support only "ready for read" logic ("ready for write" is not supported).
     * 
     * @param channels `Array` list of channels to wait on
     * @param timeoutMillis `Number|Undefined` max timeout for waiting, in milliseconds,
     *                      default value: `0` - inifinite timeout
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Number` index of the channel in specified list, that is ready for reading,
     *         `-1` on timeout
     */
    Channel.select = function(channels, timeoutMillis, callback) {
        try {
            if (!(channels instanceof Array)) {
                throw new Error("Invalid non-array 'channels' parameter specified," +
                        " channels: [" + JSON.stringify(channels, null, 4) + "]");
            }
            var handles = [];
            for (var i = 0; i < channels.length; i++) {
                handles.push(channels[i].handle);
            }
            var resStr = wiltoncall("channel_select", {
                channels: handles,
                timeoutMillis: "undefined" != typeof(timeoutMillis) ? timeoutMillis : 0
            });
            var resObj = JSON.parse(resStr);
            utils.checkPropertyType(resObj, "selectedChannelIndex", "number");
            var res = resObj.selectedChannelIndex;
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    /**
     * @static dumpRegistry
     * 
     * Dump a registry of currently active channels.
     * 
     * Dumps a registry of currently active channels as a string.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` registry dump
     */
    Channel.dumpRegistry = function(callback) {
        try {
            var res = wiltoncall("channel_dump_registry");
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    Channel.prototype = {

        /**
         * @function send
         * 
         * Send a message to the channel, blocks if channel is full.
         * 
         * Sends JSON message to the channel in blocking mode.
         * 
         * @param msg `Object|String` message to send
         * @param timeoutMillis `Number|Undefined` max timeout for waiting, in milliseconds,
         *                      default value: `0` - inifinite timeout
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Boolean` `true` if message was sent successfully, `false` if
         *         channel was closed (manually with `close()` or automatically on shutdown)
         */
        send: function(msg, timeoutMillis, callback) {
            try {
                var message = utils.defaultJson(msg);
                var resStr = wiltoncall("channel_send", {
                    channelHandle: this.handle,
                    message: message,
                    timeoutMillis: "undefined" != typeof(timeoutMillis) ? timeoutMillis : 0
                });
                var resObj = JSON.parse(resStr);
                utils.checkPropertyType(resObj, "success", "boolean");
                var res = resObj.success;
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function receive
         * 
         * Receive a message from the channel, blocks if channel is empty.
         * 
         * Receives JSON messages from the channel in blocking mode.
         * 
         * @param timeoutMillis `Number|Undefined` max timeout for waiting, in milliseconds,
         *                      default value: `0` - inifinite timeout
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Object` received message parsed from JSON, `null` if
         *         channel was closed (manually with `close()` or automatically on shutdown)
         */
        receive: function(timeoutMillis, callback) {
            try {
                var resStr = wiltoncall("channel_receive", {
                    channelHandle: this.handle,
                    timeoutMillis: "undefined" != typeof(timeoutMillis) ? timeoutMillis : 0
                });
                var res = null !== resStr ? JSON.parse(resStr) : null;
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function offer
         * 
         * Send a message to the channel, return `false` if channel is full.
         * 
         * Sends a message to the channel in non-blocking mode returning immediately.
         * 
         * Always returns `false` on synchronous channel.
         * 
         * @param msg `Object|String` message to send
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Boolean` `true` if message was sent successfully, `false` if channel is full or
         *         channel was closed (manually with `close()` or automatically on shutdown)
         */
        offer: function(msg, callback) {
            try {
                var message = utils.defaultJson(msg);
                var resStr = wiltoncall("channel_offer", {
                    channelHandle: this.handle,
                    message: message 
                });
                var resObj = JSON.parse(resStr);
                utils.checkPropertyType(resObj, "success", "boolean");
                var res = resObj.success;
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function poll
         * 
         * Poll channel for buffered messages.
         * 
         * Tries to receive a message from the channel in a non-blocking mode,
         * returns `null` if channel is empty.
         * 
         * Always returns `null` on synchronous channel.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Object` received message parsed from JSON, `null` if channel is empty or
         *         channel was closed (manually with `close()` or automatically on shutdown)
         */
        poll: function(callback) {
            try {
                var resStr = wiltoncall("channel_poll", {
                    channelHandle: this.handle
                });
                var res = null !== resStr ? JSON.parse(resStr) : null;
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }, 

        /**
         * @function peek
         * 
         * Copy pending message without removing it from channel.
         * 
         * Tries to copy a pending buffered message from the channel
         * in a non-blocking mode, returns `null` if channel is empty.
         * 
         * Can be used on synchronous channels (producer thread will NOT be unblocked on `peek()`).
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Object` pending message parsed from JSON, `null` if channel is empty or
         *         channel was closed (manually with `close()` or automatically on shutdown)
         */
        peek: function(callback) {
            try {
                var resStr = wiltoncall("channel_peek", {
                    channelHandle: this.handle
                });
                var res = null !== resStr ? JSON.parse(resStr) : null;
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }, 

        /**
         * @function synchronize
         * 
         * Run specified operations in syncronized mode.
         * 
         * Run specified operations taking the mutual exclusive lock,
         * making  it is impossible for two concurrent invocations 
         * (from different threads) of synchronized operations 
         * on the same channel to interleave.
         * 
         * Channel instance must be a buffered channel with `maxSize`=`1`
         * and must be empty.
         * 
         * If Channel is being destroyed (e.g. during shutdown),
         * this method exits without running the `operations` function
         * and without throwing an error.
         * 
         * @param operations `Function` function to run in synchronized mode
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Any` return value from `operations` function
         * 
         */
        synchronize: function(operations, callback) {
            try {
                var ms = this.maxSize();
                if (1 !== ms) {
                    throw new Error("Invalid channel max size: [" + ms + "],"+
                            " only channels with max size '1' can be used for synchronization");
                }
                var locked = this.send(true);
                if (locked) {
                    var res = null;
                    try {
                        res = operations();
                    } finally {
                        this.receive();
                    }
                } else {
                    // destruction in progress, lets be silent
                }
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function maxSize
         * 
         * Max number of buffered messages.
         * 
         * Returns buffer size for buffered `Channel` and 
         * `0` for sycnhronous.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Number` buffer size for buffered `Channel` and `0` for sycnhronous
         */
        maxSize: function(callback) {
            try {
                var str = wiltoncall("channel_get_max_size", {
                    channelHandle: this.handle
                });
                var obj = JSON.parse(str);
                var res = obj.maxSize;
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function name
         * 
         * Name of this channel.
         * 
         * Returns name of this channel, channel must be alive (not closed).
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `String` channel name
         */
        name: function(callback) {
            try {
                var res = wiltoncall("channel_get_name", {
                    channelHandle: this.handle
                });
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function close
         * 
         * Close the channel releasing native resources.
         * 
         * Closes the channel, all waiting threads are unblocked
         * with negative (for write) and null (for read) result.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        close: function(callback) {
            try {
                wiltoncall("channel_close", {
                    channelHandle: this.handle
                });
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }
    };

    return Channel;
});
