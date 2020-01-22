/*
 * Copyright 2018, alex at staticlibs.net
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
 * @namespace DelayedResponse
 * 
 * __wilton/DelayedResponse__ \n
 * Send HTTP response to client from another thread
 * 
 * This module allows to send a "delayed" HTTP response
 * to client. To create a `DelayedResponse` instance, first
 * `responseWriterHandle` needs to be obtained inside the
 * `Server` request handler (view) using the `req.sendResponseLater()`function.
 * 
 * `DelayedResponse` may be created from any thread specifying the
 * `responseWriterHandle` as an argument.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // inside server request handler
 * GET: function(req) {
 *     // delay sending a response
 *     // and release the current worker thread
 *     // creating a responseWriterHandle
 *     var handle = req.sendResponseLater();
 * 
 *     // pass the handle to other thread using some channel
 *     chan.send({
 *         handle: handle
 *     });
 * }
 * 
 * // in other thread
 * var obj = chan.receive();
 * var writer = new DelayedResponse(obj.handle);
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
     * @function DelayedResponse
     * 
     * Create `DelayedResponse` instance.
     * 
     * Creates `DelayedResponse` object instance that can be used to
     * send HTTP response to client from the different thread.
     * 
     * @param responseWriterHandle `Number` handle value, that must be obtained
     *                             inside request handler (view) using
     *                             `req.sendResponseLater()` call and (optionally) be passed
     *                             to another thread after that
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` `DelayedResponse` instance
     * 
     */
    var DelayedResponse = function(responseWriterHandle, callback) {
        try {
            if ("number" !== typeof(responseWriterHandle) || 0 === responseWriterHandle) {
                throw new Error("Invalid 'responseWriterHandle' specified: [" + responseWriterHandle + "]");
            }
            this.handle = responseWriterHandle;
            utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    };

    DelayedResponse.prototype = {

        /**
         * @function send
         * 
         * Send string or JSON response to client.
         * 
         * Sends response to client converting specified object into
         * JSON if necessary (`Content-Type` is set to `application/json` in
         * this case).
         * 
         * @param data `String|Object` response body, object will be converted to JSON
         * @param options `Object|Undefined` configuration object, see possible options below
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         * 
         * __Options__
         *  - __meta__ `Object` response metadata
         *    - __statusCode__ `Number` HTTP status code
         *    - __statusMessage__ `String` HTTP status message
         *    - __headers__ `Object` response headers in `"Header-Name": "value"` format
         */
        send: function(data, options, callback) {
            var opts = utils.defaultObject(options);
            try {
                // metatada
                if ("object" === typeof(data)) {
                    // sending json
                    opts.meta = utils.defaultObject(opts.meta);
                    opts.meta.headers = utils.defaultObject(opts.meta.headers);
                    if ("undefined" === typeof(opts.meta.headers["Content-Type"])) {
                        opts.meta.headers["Content-Type"] = "application/json";
                    }
                }
                if ("object" === typeof (opts.meta) && null !== opts.meta) {
                    wiltoncall("request_set_metadata_with_response_writer", {
                        responseWriterHandle: this.handle,
                        metadata: opts.meta
                    });
                }
                // data
                var dt = utils.defaultJson(data);
                wiltoncall("request_send_with_response_writer", {
                    responseWriterHandle: this.handle,
                    data: dt
                });
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        }
    };

    return DelayedResponse;
});
