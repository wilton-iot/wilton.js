/*
 * Copyright 2020, alex at staticlibs.net
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
 * @namespace DelayedWebSocket
 * 
 * __wilton/DelayedWebSocket__ \n
 * Send WebSocket message to client from another thread
 * 
 * This module allows to send a "delayed" WebSocket message
 * to client. To create a `DelayedWebSocket` instance, first
 * `webSocketHandle` needs to be obtained inside the
 * `Server` request handler (view) using the `req.retainWebSocket()`function.
 * 
 * `DelayedWebSocket` may be created from any thread specifying the
 * `webSocketHandle` as an argument.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // inside server request handler
 * GET: function(req) {
 *     // delay sending a response
 *     // and release the current worker thread
 *     // creating a webSocketHandle
 *     var handle = req.retainWebSocket();
 * 
 *     // pass the handle to other thread using some channel
 *     chan.send({
 *         handle: handle
 *     });
 * }
 * 
 * // in other thread
 * var obj = chan.receive();
 * var writer = new DelayedWebSocket(obj.handle);
 * writer.send({
 *     foo: "bar"
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
     * @function DelayedWebSocket
     * 
     * Create `DelayedWebSocket` instance.
     * 
     * Creates `DelayedWebSocket` object instance that can be used to
     * send WebSocket message to client from the different thread.
     * 
     * @param webSocketHandle `Number` handle value, that must be obtained
     *                             inside request handler (view) using
     *                             `req.retainWebSocket()` call and (optionally) be passed
     *                             to another thread after that
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` `DelayedResponse` instance
     * 
     */
    var DelayedWebSocket = function(webSocketHandle, callback) {
        try {
            if ("number" !== typeof(webSocketHandle) || 0 === webSocketHandle) {
                throw new Error("Invalid 'webSocketHandle' specified: [" + webSocketHandle + "]");
            }
            this.handle = webSocketHandle;
            utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    };

    DelayedWebSocket.prototype = {

        /**
         * @function send
         * 
         * Send string or JSON message to client and release WebSocket.
         * 
         * Sends message to client converting specified object into
         * JSON if necessary. After this call previously retained WebSocket
         * is released (this object cannot be used anymore) and continues
         * to process incoming messages.
         * 
         * @param data `String|Object` response body, object will be converted to JSON
         * @param options `Object|Undefined` configuration object, currently not used
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        send: function(data, options, callback) {
            if ("undefined" === typeof(callback)) {
                callback = options;
            }
            // var opts = utils.defaultObject(options);
            try {
                var dt = utils.defaultJson(data);
                wiltoncall("request_send_with_websocket", {
                    webSocketHandle: this.handle,
                    data: dt
                });
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function close
         * 
         * Close WebSocket.
         * 
         * Closes this WebSocket.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        close: function(callback) {
            try {
                wiltoncall("request_close_websocket", {
                    webSocketHandle: this.handle
                });
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        }
    };

    return DelayedWebSocket;
});
