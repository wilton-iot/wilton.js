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
 * @namespace web_httpClient
 * 
 * __wilton/web/httpClient__ \n
 * HTTP client for web-browsers.
 * 
 * This module allows to use XHR requests in web-browsers with
 * API similar to `wilton/httpClient`
 * 
 * Usage example:
 * 
 * @code
 * 
 * // send GET request
 * http.sendRequest("https://google.com", function(err, resp) {
 *     console.log(resp.data);
 * });
 * 
 * // send POST request and allow error responses
 * var resp2 = http.sendRequest(url, {
 *     data: "foo",
 *     meta: {
 *         abortOnResponseError: false,
 *         method: "POST" // optional, if data is specified
 *     }
 * }, function(err, resp) { ... });
 * 
 * @endcode
 */
define([], function() {
    "use strict";

    function undefinedOrNull(obj) {
        return "undefined" === typeof (obj) || null === obj;
    }

    function nonEmptyString(str) {
        return "string" === typeof(str) && str.length > 0;
    }

    function defaultObject(obj) {
        var res = {};
        if ("object" === typeof (obj) && null !== obj) {
            res = obj;
        }
        return res;
    }

    function checkUrl(url) {
        if (!nonEmptyString(url)) {
            throw new Error("Invalid url specified: [" + url + "]");
            
        }
    }

    function checkStrayOpts(opts) {
        for (var key in opts) {
            if (opts.hasOwnProperty(key) && "data" !== key && "meta" !== key) {
                throw new Error("Invalid option specified: [" + key + "]," +
                        " allowed options: [data, meta]");
            }
        }
    }

    function extractData(opts) {
        if (undefinedOrNull(opts.data)) {
            return null;
        }
        if ("string" === typeof(opts.data)) {
            return opts.data;
        }
        if ("object" === typeof(opts.data)) {
            return JSON.stringify(opts.data, null, 4);
        }
        throw new Error("Invalid data specified: [" + opts.data + "]");
    }

    function extractAbortOnResponseError(meta) {
        if ("boolean" !== typeof(meta.abortOnResponseError)) {
            throw new Error("Invalid meta.abortOnResponseError specified," +
                    " value: [" + meta.abortOnResponseError + "]");
        }
        return meta.abortOnResponseError;
    }

    function extractMethod(meta) {
        if ("string" === typeof(meta.method) && (
                "GET" === meta.method ||
                "POST" === meta.method ||
                "PUT" === meta.method ||
                "DELETE" === meta.method ||
                "HEAD" === meta.method ||
                "OPTIONS" === meta.method ||
                "TRACE" === meta.method ||
                "UPGRADE" === meta.method)) {
            return meta.method;
        }
        throw new Error("Invalid meta.method specified," +
                " value: [" + meta.method + "]");
    }

    function extractTimeout(meta) {
        if ("number" === typeof(meta.timeoutMillis) &&
                meta.timeoutMillis >= 0) {
            return meta.timeoutMillis;
        }
        throw new Error("Invalid meta.timeoutMillis specified," +
                " value: [" + meta.timeoutMillis + "]");
    }

    function extractHeaders(meta) {
        var headers = {};
        if ("object" === typeof(meta.headers)) {
            for (var he in meta.headers) {
                if (meta.headers.hasOwnProperty(he)) {
                    var value = meta.headers[he];
                    if ("string" !== typeof(value)) {
                        throw new Error("Invalid meta.headers entry specified," +
                                " header: [" + he + "]" +
                                " value: [" + value + "]");
                    }
                    headers[he] = value;
                }
            }
            return headers;
        }
        throw new Error("Invalid meta.headers specified," +
                " value: [" + meta.headers + "]");
    }

    function extractMeta(opts, data) {
        var meta = {
            abortOnResponseError: true,
            method: null !== data ? "POST" : "GET",
            timeoutMillis: 0,
            headers: {}
        };
        if (undefinedOrNull(opts.meta)) {
            return meta;
        }
        if ("object" !== typeof(opts.meta)) {
            throw new Error("Invalid meta specified: [" + meta + "]");
        }
        for (var key in opts.meta) {
            if (opts.meta.hasOwnProperty(key)) {
                if ("abortOnResponseError" === key) {
                    meta.abortOnResponseError = extractAbortOnResponseError(opts.meta);
                } else if ("method" === key) {
                    meta.method = extractMethod(opts.meta);
                } else if ("timeoutMillis" === key) {
                    meta.timeoutMillis = extractTimeout(opts.meta);
                } else if ("headers" === key) {
                    meta.headers = extractHeaders(opts.meta);
                } else {
                    throw new Error("Invalid meta field specified: [" + key + "]");
                }
            }
        }
        return meta;
    }

    function callOrThrow(onFailure, e, res) {
        if ("function" === typeof (onFailure)) {
            onFailure(e);
            if ("undefined" !== typeof (res)) {
                return res;
            }
        } else {
            if (e instanceof Error) {
                throw e;
            } else {
                throw new Error(String(e));
            }
        }
    }

    function jsonParse(callback) {
        try {
            if (null === this.jsonCached) {
                var json = this.data;
                this.jsonCached = JSON.parse(json);
            }
            if ("function" === typeof(callback)) {
                callback(null, this.jsonCached);
            }
            return this.jsonCached;
        } catch (e) {
            callOrThrow(callback, e);
        }
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders#Example
    function parseHeaders(headers) {
        // Convert the header string into an array
        // of individual headers
        var arr = headers.trim().split(/[\r\n]+/);
        // Create a map of header names to values
        var map = {};
        for (var i = 0; i < arr.length; i++) {
            var line = arr[i];
            var parts = line.split(': ');
            var header = parts.shift();
            var value = parts.join(': ');
            map[header] = value;
        }
        return map;
    }

    /**
     * @function sendRequest
     * 
     * Send XHR request to server.
     * 
     * Sends XHR request to server, call callback on response
     * received or on timeout.
     * 
     * @param url `String` URL of the HTTP server
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive response or error,
     *                 see response description below
     * @returns `Object` XHR object
     * 
     * __Options__
     * 
     *  - __data__ `String|Object|Undefined` data to send in request body, specified object
     *             will be converted to JSON
     *  - __meta__: `Object|Undefined` request metadata
     *    - __headers__ `Object|Undefined` request headers in `"Header-Name": "value"` format
     *    - __method__ `String|Undefined` HTTP method to use for this request, default value
     *                 is `GET`, if request `data` is not specified, `POST` otherwise
     *    - __abortOnResponseError__ `Boolean|Undefined` whether to throw an `Error`, if response status
     *                               code `>=400` is returned, default value: `true`
     *    - __timeoutMillis__ `Number|Undefined` maximum time the request is allowed to take, in milliseconds,
     *                        default value: `0`
     * 
     * __Response__
     * 
     *  - __data__ `String` data as a `String`
     *  - __json__ `Function` parses the contents of `data` field as a JSON, resulting
     *             JSON object is cached for this response instance - the same object is
     *             returned for the following `json()` invocations
     *  - __headers__ `Object` response headers in `"Header-Name": "value"` format
     *  - __effectiveUrl__ `String` final URL (after possible redirection) that was used
     *  - __responseCode__ `Number` HTTP response status code
     */
    function sendRequest(url, options, callback) {
        checkUrl(url);
        var opts = defaultObject(options);
        var cb = callback;
        if ("undefined" === typeof(callback) && "function" === typeof(options)) {
            cb = options;
        }
        checkStrayOpts(opts);
        var data = extractData(opts);
        var meta = extractMeta(opts, data);
        var xhr = new XMLHttpRequest();
        xhr.open(meta.method, url, true);
        xhr.timeout = meta.timeoutMillis;
        for (var he in meta.headers) {
            if (meta.headers.hasOwnProperty(he)) {
                xhr.setRequestHeader(he, meta.headers[he]);
            }
        }
        if ("function" === typeof(cb)) {
            xhr.onreadystatechange = function() {
                if (4 !== xhr.readyState) {
                    return;
                }
                var resp = {
                    data: xhr.responseText,
                    jsonCached: null,
                    json: jsonParse,
                    headers: parseHeaders(xhr.getAllResponseHeaders()),
                    effectiveUrl: xhr.responseURL,
                    responseCode: xhr.status
                };
                var err = null;
                if (0 === xhr.status && meta.timeoutMillis > 0) {
                    err = "Request timeout exceeded, value: [" + meta.timeoutMillis + "]";
                } else if (meta.abortOnResponseError && xhr.status >= 400) {
                    err = xhr.statusText;
                }
                cb(err, resp);
            };
        }
        xhr.send(data);
        return xhr;
    }

    return {
        sendRequest: sendRequest
    };

});
