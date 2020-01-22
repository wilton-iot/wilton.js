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
 * @namespace Server
 * 
 * __wilton/Server__ \n
 * HTTP server.
 * 
 * This module allows to start HTTP servers and
 * handle incoming requests using specified modules/functions.
 * 
 * Each value specified in `views` parameter, is used both as
 * a name of the module to handle the requests and as an URL path to route
 * the requests to this module.
 * 
 * `GET`, `POST`, `PUT`, `DELETE` and `OPTIONS` (for CORS support) methods are used inside
 * the handler modules to handle incoming requests with the corresponding HTTP method.
 * 
 * Additionally `WSOPEN`, `WSMESSAGE` and `WSCLOSE` WebSocket event names can be used
 * inside hanler modules to handle incoming WebSocket events.
 * 
 * `Server` can also serve static files (from file-system or from ZIP files)
 * specifying `documentRoots` configuration parameter.
 * 
 * `Server` supports HTTPS (certificates must be specified) and
 * can be configured to require client `X.509` certificates.
 * 
 * `Server` can be stopped to release system resources using `stop()` method,
 * otherwise it will be stopped during the shutdown.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // inside "index.js"
 * 
 * // start server
 * var server = new Server({
 *     tcpPort: 8080,
 *     views: [
 *         "server/views/hi",
 *         "server/views/bye"
 *     ]
 * });
 * 
 * // active URLS:
 * // http://127.0.0.1:8080/server/views/hi
 * // http://127.0.0.1:8080/server/views/bye
 * 
 * // wait for Ctrl+C (in console app)
 * misc.waitForSignal();
 * 
 * // stop server
 * server.stop();
 * 
 * 
 * // inside "server/views/hi.js"
 * 
 * GET: function(req) {
 *     req.sendResponse("hello from GET handler");
 * },
 *
 * POST: function(req) {
 *     req.sendResponse({
 *         msg: "hello from POST handler"
 *     });
 * }
 * 
 * @endcode
 * 
 */
define([
    "./dyload",
    "./Request",
    "./utils",
    "./wiltoncall"
], function(dyload, Request, utils, wiltoncall) {
    "use strict";

    dyload({
        name: "wilton_server"
    });

    var METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "WSOPEN", "WSMESSAGE", "WSCLOSE"];

    function createMethodEntries(filters, vi) {
        var mod = null;
        try {
            mod = WILTON_requiresync(vi);
        } catch(e) {
            throw new Error("Error loading Server view, module: [" + vi + "]\n" + utils.formatError(e));
        }
        var methodEntries = [];
        for (var j = 0; j < METHODS.length; j++) {
            var me = METHODS[j];
            if ("function" === typeof(mod[me])) {
                methodEntries.push({
                    method: me,
                    path: "/" + vi,
                    callbackScript: {
                        // dispatched module to be called from native
                        module: "wilton/Server",
                        func: "dispatch",
                        args: [{
                            // actual handled module to be called by dispatcher
                            module: vi,
                            func: me,
                            args: []
                        }, filters] // requestHandle will be appended here at native
                    }
                });
            }
        }
        if (0 === methodEntries.length) {
            throw new Error("Invalid 'views' element: must have one or more" +
                    " function attrs: GET, POST, PUT, DELETE, OPTIONS, WSOPEN, WSMESSAGE, WSCLOSE");
        }
        return methodEntries;
    }

    function prepareViews(filters, views) {
        if(utils.undefinedOrNull(views)) {
            throw new Error("Invalid null 'views'attribute specified");
        }
        if (!(views instanceof Array)) {
            throw new Error("Invalid non-array 'views'attribute specified");
        }
        var res = [];
        for (var i = 0; i < views.length; i++) {
            var vi = views[i];
            if (utils.undefinedOrNull(vi)) {
                throw new Error("Invalid null 'views' element, index: [" + i + "]");
            } else if ("string" === typeof(vi)) {
                var methodEntries = createMethodEntries(filters, vi);
                for (var j = 0; j < methodEntries.length; j++) {
                    res.push(methodEntries[j]);
                }
            } else {
                utils.checkProperties(vi, ["method", "path", "callbackScript"]);
                res.push(vi);
            }
        }
        return res;
    }

    function prepareFilters(filters) {
        if (utils.undefinedOrNull(filters)) {
            return [];
        }
        if (!(filters instanceof Array)) {
            throw new Error("Invalid non-array 'filters' element specified");
        }
        for (var i = 0; i < filters.length; i++) {
            if ("string" !== typeof (filters[i])) {
                throw new Error("Invalid non-string 'filter' module specified, index: [" + i + "]");
            }
        }
        return filters;
    }

    /**
     * @function Server
     * 
     * Start HTTP server.
     * 
     * Starts HTTP server binding the connection on a specified TCP port.
     * Server worker threads are run in background.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` `Serial` instance
     * 
     * __Options__
     *  - __views__ `Array` list of module names that will be used to handle incoming request;
     *              the same module names are also used as URL paths for requiests routing;
     *              functions with following names are used inside the handler module to handle the
     *              requests:`GET`, `POST`, `PUT`, `DELETE` and `OPTIONS`;
     *              the following method names can be used for WebSocket events:
     *              `WSOPEN`, `WSMESSAGE` and `WSCLOSE`;
     *              each handler function receives `Request` instance as an only parameter
     *              and must use `sendResponse()`, `sendTempFile()`, `sendMustache()` or
     *              `sendWebSocket()` methods to return the response to client;
     *  - __filters__ `Array` list of module names that will be called on the incoming request,
     *                each module must return a `function(req, doFilter)`, and can either
     *                call `doFilter(req)` to proceed to the next filter (and eventually -
     *                to the request view), or handle the request with `sendResponse()`
     *  - __numberOfThreads__ `Number|Undefined` number of background threads to start, default value: `2`
     *  - __tcpPort__ `Number|Undefined` TCP port to bind to, default value: `8080`
     *  - __ipAddress__ `String|Undefined` IP address to bind to, default value: `0.0.0.0`
     *  - __ssl__ `Object|Undefined` HTTPS configuration
     *    - __keyFile__ `String` path to SSL certificate file that must also contain a private key
     *    - __keyPassword__ `String` SSL server certificate (private key) password
     *    - __verifyFile__ `String|Undefined` path to SSL CA certificate to use for validation
     *                      of client `X.509` certificate
     *    - __verifySubjectSubstr__ `String|Undefined` substring of the client `X.509` certificate
     *                              subject that will be checked during the client certificate check
     *  - __documentRoots__ `Array|Undefined` configuration for serving static files
     *    - __resource__ `String` URL path for this entry
     *    - __dirPath__ `String|Undefined` path to file-system directory to serve files from
     *    - __zipPath__ `String|Undefined` path to ZIP file to server files from
     *    - __zipInnerPrefix__`String|Undefined` prefix to strip from ZIP paths when serving files from ZIP
     *    - __cacheMaxAgeSeconds__ `Number|Undefined` value for `Cache-Control`'s `max-age` field
     *                             to use for files server from this `documentRoot`,
     *                             in seconds, default value: `604800`
     *    - __mimeTypes__ `Array|Undefined` list of MIME types mapping for this `documentRoot`
     *      - __extension__ `String` file extension (`CSS`, `JS` etc)
     *      - __mime__ `String` MIME type for this extension
     *  - __requestPayload__ `Object|Undefined` configuration for handling requests payload
          - __tmpDirPath__ `String` path to the directory where temporary files with requests
                           payloads will be stored
          - __tmpFilenameLen__ `Number|Undefined` length of the generated random names for
                               temporary files, default value: `32`
          - __memoryLimitBytes__ `Number|Undefined` max size of the request payload that is
                                 allowed to process in-memory without dumping it into file,
                                 in bytes, default value: `1048576`
     *  - __mustache__ `Object` configuration for [mustache](https://mustache.github.io/) responses
     *    - __partialsDirs__ `Array` list of directories to use for loading mustache partial
     *                      templates when returning rendered mustache templates using
     *                      `Request.sendMustache()`
     *  - __handle__ `Number|Undefined` handle to access `Server` instance from another thread
     *  
     */
    var Server = function(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            if (utils.hasPropertyWithType(opts, "handle", "number")) {
                this.handle = opts.handle;
            } else {
                var filters = prepareFilters(opts.filters);
                delete opts.filters;
                opts.views = prepareViews(filters, opts.views);
                var handleJson = wiltoncall("server_create", opts);
                var handleObj = JSON.parse(handleJson);
                this.handle = handleObj.serverHandle;
            }
            utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    };

    Server.prototype = {
        /**
         * @function stop
         * 
         * Stop HTTP server.
         * 
         * Stops HTTP server releasing system resources,
         * active servers will be stopped automatically on shutdown.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        stop: function(callback) {
            try {
                wiltoncall("server_stop", {
                    serverHandle: this.handle
                });
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function broadcastWebSocket
         * 
         * Broadcast a message to WebSocket clients
         * 
         * Broadcasts the message to all the WebSocket clients
         * currently connected on the specified `path`.
         * 
         * May cause the broadcast message
         * to interleave with other frames (put in the middle of continuation sequence, or
         * in the middle to TCP fragmented sequence), if target connection is used for
         * outbound traffic at the the time of broadcast.
         * 
         * List of clients to include into broadcast may be specified directly
         * using `idList` option.
         * 
         * @param options `Object` configuration object, see possible options below
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         * 
         * __Options__
         *  - __path__ `String` WebSocket path to broadcast on
         *  - __message__ `String|Object` message to send, specified `Object` will be
         *                converted to JSON
         *  - __idList__ `Array|Undefined` optional list of WebSocket client IDs to include
         *                into the broadcast
         */
        broadcastWebSocket: function(options, callback) {
            var opts = utils.defaultObject(options);
            try {
                opts.message = utils.defaultJson(opts.message);
                opts.serverHandle = this.handle;
                wiltoncall("server_broadcast_websocket", opts);
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        }
    };

    function dispatch(callbackScriptJson, filters, requestHandle) {
        var cs = callbackScriptJson;
//        if ("string" !== typeof (cs.module) || "string" !== typeof (cs.func) ||
//                "undefined" === typeof (cs.args) || !(cs.args instanceof Array)) {
//            throw new Error("Invalid 'callbackScriptJson' specified: [" + JSON.stringofy(cs) + "]");
//        }
        var module = WILTON_requiresync(cs.module);
        var req = new Request(requestHandle);
        var idx = 0;
        function doFilter(req) {
            if (idx < filters.length) {
                var filterFun = WILTON_requiresync(filters[idx]);
                idx += 1;
                filterFun.call(null, req, doFilter);
                return;
            }
            // target call
            module[cs.func].call(module, req);
        }
        doFilter(req);
        return null;
    };
    Server.dispatch = dispatch;
    
    return Server;

});
