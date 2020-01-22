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
 * @namespace Request
 * 
 * __wilton/Request__ \n
 * HTTP requests handling for `wilton/Server`.
 * 
 * This module provides a `Request` "class", which instances are passed
 * to handler functions registered with `wilton/Server`.
 * 
 * Each handler function receives `Request` instance as an only parameter
 * and must use `sendResponse()`, `sendTempFile()`, `sendMustache()`
 * or `sendWebSocket()` methods to return the response to client
 * 
 * Usage example:
 * 
 * @code
 * 
 * // handler function for GET requests
 * GET: function(req) {
 * 
 *     // return JSON response including some request details into it
 *     // and specified custom status code and message
 *     req.sendResponse({
 *         msg: "hello from GET handler",
 *         receivedQueries: req.queries(),
 *         hostnameClientSpecified: req.headers()["Host"]
 *     }, {
 *         meta: {
 *             statusCode: 451,
 *             statusMessage: "Unavailable For Legal Reasons"
 *         }
 *     });
 * }
 * 
 * @endcode
 */

define([
    "./DelayedWebSocket",
    "./utils",
    "./wiltoncall"
], function(DelayedWebSocket, utils, wiltoncall) {
    "use strict";
    
    var Request = function(requestHandle) {
        this.handle = requestHandle;
        this.metaCached = null;
        this.dataCached = null;
        this.formCached = null;
        this.jsonCached = null;
        this.dataFilenameCached = null;
    };
 
    Request.prototype = {
        /**
         * @function meta
         * 
         * Access request's metadata.
         * 
         * Returns a metadata object for this request.
         * 
         * Metadata is fetched once using a native call and
         * is cached locally inside `Request` object after that.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Object` metadata object with the following fields:
         * 
         *  - __httpVersion__ `String` HTTP protocol version
         *  - __protocol__ `String` protocol name, `HTTP` or `HTTPS`
         *  - __method__ `String` request HTTP method
         *  - __url__ `String` request URL, as specified by client
         *  - __pathname__ `String` "path" part of the URL (before the first `?`)
         *  - __query__ `String` "query" part of the URL (after the first `?`)
         *  - __queries__ `Object` dictionary of request parameters parsed from URL
         *                `query` fields
         *  - __headers__ `Object` request headers in `"Header-Name": "value"` format,
         *                duplicates in client-specified headers
         *                are handled in the following ways, depending on the header name:
         *                duplicates of `age`, `authorization`, `content-length`, 
         *                `content-type`, `etag`, `expires`, `from`, `host`, `if-modified-since`,
         *                `if-unmodified-since`, `last-modified`, `location`, `max-forwards`,
         *                `proxy-authorization`, `referer`, `retry-after`, or `user-agent` are discarded;
         *                 for all other headers, the values are joined together with `, `
         * 
         */
        meta: function(callback) {
            try {
                if (null === this.metaCached) {
                    var json = wiltoncall("request_get_metadata", {
                        requestHandle: this.handle
                    });
                    this.metaCached = JSON.parse(json);
                }
                return utils.callOrIgnore(callback, this.metaCached);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function headers
         * 
         * Access request headers.
         * 
         * Returns dictionary of request headers.
         * The same as `meta().headers`.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Object` dictionary of request parameters parsed from URL query fields
         */
        headers: function(callback) {
            try {
                var res = this.meta().headers;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function queries
         * 
         * Access request query string parameters.
         * 
         * Returns dictionary of request parameters parsed from URL
         * query fields. The same as `meta().queries`.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Object` dictionary of request parameters parsed from URL query fields
         */
        queries: function(callback) {
            try {
                var res = this.meta().queries;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function query
         * 
         * Access request quesry string parameter by name.
         * 
         * Returns the value of the specified parameter from request string,
         * or specified `defaultValue` if parameter not found.
         * 
         * @param name `String` parameter name
         * @param defaultValue `String` default value
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `String` parameter value or default value
         */
        query: function(name, defaultValue, callback) {
            try {
                var qrs = this.meta().queries;
                var dv = "undefined" !== defaultValue ? defaultValue : null;
                var res = qrs.hasOwnProperty(name) ? qrs[name] : dv;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function data
         * 
         * Access request body.
         * 
         * Returns request body as a `String`. Empty string is
         * returned for `GET` requests.
         * 
         * If input request data was saved into temporary file
         * (due to `requestPayload.memoryLimitBytes` server config parameter
         * exceeded), that file will be read into memory on the first call to this
         * method.
         * 
         * Data is fetched once using a native call and
         * is cached locally inside `Request` object after that.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `String` request body
         */
        data: function(callback) {
            try {
                if (null === this.dataCached) {
                    this.dataCached = wiltoncall("request_get_data", {
                        requestHandle: this.handle
                    });
                }
                return utils.callOrIgnore(callback, this.dataCached);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function form
         * 
         * Access `application/x-www-form-urlencoded` request body.
         * 
         * Returns request body as a JSON object.
         * 
         * If input request data was saved into temporary file
         * (due to `requestPayload.memoryLimitBytes` server config parameter
         * exceeded), that file will be read into memory on the first call to this
         * method.
         * 
         * Form data is fetched once using a native call and
         * is cached locally inside `Request` object after that.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `String` request body
         */
        form: function(callback) {
            try {
                if (null === this.formCached) {
                    var json = wiltoncall("request_get_form_data", {
                        requestHandle: this.handle
                    });
                    this.formCached = JSON.parse(json);
                }
                return utils.callOrIgnore(callback, this.formCached);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function json
         * 
         * Access request body as JSON.
         * 
         * Returns request body parsed as a JSON object.
         * 
         * If input request data was saved into temporary file
         * (due to `requestPayload.memoryLimitBytes` `Server` configuration parameter
         * was exceeded), that file will be read into memory on the first call to this
         * method.
         * 
         * JSON body is fetched once using a native call and
         * is cached locally inside `Request` object after that.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Object` request body as JSON object
         */
        json: function(callback) {
            try {
                if (null === this.jsonCached) {
                    var json = this.data();
                    this.jsonCached = JSON.parse(json);
                }
                return utils.callOrIgnore(callback, this.jsonCached);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function dataFilename
         * 
         * Get the name of the temporary file with request data.
         * 
         * Returns a path to the temporary file that was used to
         * store request data.
         * 
         * If input request data was not saved into temporary file
         * (processed in memory due to `requestPayload.memoryLimitBytes`
         * `Server` configuration parameter was not exceeded),request data 
         * will be written into temporary file on the first call to this method.
         * 
         * `requestPayload.tmpDirPath` `Server` configuration parameter
         * must be specified for this method to work.
         * 
         * Path to temporary file fetched once using a native call and
         * is cached locally inside `Request` object after that.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `String` path to temporary file with request body
         */
        dataFilename: function(callback) {
            try {
                if (null === this.dataFilenameCached) {
                    this.dataFilenameCached = wiltoncall("request_get_data_filename", {
                        requestHandle: this.handle
                    });
                }
                return utils.callOrIgnore(callback, this.dataFilenameCached);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function sendResponse
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
        sendResponse: function(data, options, callback) {
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
                this._setMeta(opts);
                // data
                var dt = utils.defaultJson(data);
                wiltoncall("request_send_response", {
                    requestHandle: this.handle,
                    data: dt
                });
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function sendTempFile
         * 
         * Send contents of temporary file to client.
         * 
         * Sends to client contents of the specified file.
         * File is deleted after sending the response.
         * 
         * File data is sent in streaming mode without reading the whole
         * contents of the file into memory.
         * 
         * @param filePath `String` path to file to send
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
        sendTempFile: function(filePath, options, callback) {
            var opts = utils.defaultObject(options);
            try {
                this._setMeta(opts);
                wiltoncall("request_send_temp_file", {
                    requestHandle: this.handle,
                    filePath: filePath
                });
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function sendWebSocket
         * 
         * Send string or JSON response to client over WebSocket.
         * 
         * Sends response to client converting specified object into
         * JSON if necessary over the WebSocket connection
         * 
         * @param data `String|Object` response body, object will be converted to JSON
         * @param options `Object|Undefined` configuration object, currently ignored
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         * 
         */
        sendWebSocket: function(data, options, callback) {
            try {
                // data
                var dt = utils.defaultJson(data);
                wiltoncall("request_send_response", {
                    requestHandle: this.handle,
                    data: dt
                });
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function closeWebSocket
         * 
         * Close WebSocket connection.
         * 
         * Closed WebSocket sending `close` frame to client and
         * closing the underlying TCP connection
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         * 
         */
        closeWebSocket: function(callback) {
            try {
                var wsHandle = this.retainWebSocket();
                var dws = new DelayedWebSocket(wsHandle);
                dws.close();
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function getWebSocketId
         * 
         * Return the ID of the WebSocket connection
         * 
         * Returns the ID of the current WebSocket connection.
         * This ID can be used to filter `Server.broadcastWebSocket` messages.
         * 
         * For HTTP requests returns empty string.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         * 
         */
        getWebSocketId: function(callback) {
            try {
                var key = this.headers()["Sec-WebSocket-Key"];
                var res = "";
                if ("string" === typeof(key)) {
                    res = key;
                }
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function sendMustache
         * 
         * Send rendered [mustache](https://mustache.github.io/) template to client.
         * 
         * Renders mustache template using specified input values and send it
         * to client. Rendered response is sent in streaming mode without holding
         * the whole response in memory.
         * 
         * Mustache partials are loaded automatically from directories, specified
         * using `mustache.partialDirs` `Server` configuration parameter.
         * 
         * @param filePath `String` path to mustache template file; if specified file
         *                 ends with `.js`, this extension will be stripped and
         *                 `.html` extension will be appended
         * @param values `Object` input values to render the template with
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
        sendMustache: function(filePath, values, options, callback) {
            var opts = utils.defaultObject(options);
            try {
                if ("string" !== typeof(filePath)) {
                    throw new Error("Invalid non-string 'filePath' parameter specified");
                }
                var fpath = filePath;
                if (utils.endsWith(fpath, ".js")) {
                    fpath = fpath.substring(0, fpath.length - 3) + ".html";
                }
                // metatada, sending html
                opts.meta = utils.defaultObject(opts.meta);
                opts.meta.headers = utils.defaultObject(opts.meta.headers);
                if ("undefined" === typeof(opts.meta.headers["Content-Type"])) {
                    opts.meta.headers["Content-Type"] = "text/html";
                }
                this._setMeta(opts);
                // data
                var vals = utils.defaultObject(values);
                wiltoncall("request_send_mustache", {
                    requestHandle: this.handle,
                    mustacheFilePath: fpath,
                    values: vals
                });
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function sendRedirect
         * 
         * Redirect client to the specified URL
         * 
         * Sends `303 See Other` with the specified location
         * 
         * @param location `String` URL to redirect clien to
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        sendRedirect: function(location, callback) {
            try {
                wiltoncall("request_set_response_metadata", {
                    requestHandle: this.handle,
                    metadata: {
                        statusCode: 303,
                        statusMessage: "See Other",
                        headers: {
                            Location: location
                        }
                    }
                });
                wiltoncall("request_send_response", {
                    requestHandle: this.handle,
                    data: ""
                });
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function sendResponseLater
         * 
         * Delay sending the response
         * 
         * Creates a `responseWriterHandle` and releases
         * the current thread without sending the response.
         * Response can be sent to client later from any thread
         * using the `DelayedResponse`, that must be created with the
         * returned handle as an argument.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Number` `responseWriterHandle` that can be used to create
         *         a `DelayedResponse` inside another thread
         * 
         */
        sendResponseLater: function(callback) {
            try {
                var jsonStr = wiltoncall("request_send_later", {
                    requestHandle: this.handle
                });
                var json = JSON.parse(jsonStr);
                var res = json.responseWriterHandle;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function retainWebSocket
         * 
         * Retain WebSocket connection to use it from another thread
         * 
         * Creates a `webSocketHandle`, that can be transfered to other thread
         * and used here to create `DelayedWebSocket`.
         * 
         * While being in `delayed` state, this WebSocket connection does not process
         * incoming messages (they are buffered meanwhile).
         * 
         * `DelayedWebSocket` can be used only for a single operation - 
         * either sending a message to client or closing the connection.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Number` `webSocketHandle` that can be used to create
         *         a `DelayedWebSocket` inside another thread
         * 
         */
        retainWebSocket: function(callback) {
            try {
                var jsonStr = wiltoncall("request_retain_websocket", {
                    requestHandle: this.handle
                });
                var json = JSON.parse(jsonStr);
                var res = json.webSocketHandle;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },
 
        _setMeta: function(opts) {
            if ("object" === typeof (opts.meta) && null !== opts.meta) {
                wiltoncall("request_set_response_metadata", {
                    requestHandle: this.handle,
                    metadata: opts.meta
                });
            }
        }
    };

    return Request;
});
