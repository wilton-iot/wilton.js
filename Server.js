/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./nativeLib", "./utils", "./Logger"], function(nativeLib, utils, Logger) {
    "use strict";

    // Response

    var Response = function(server, handle) {
        this.server = server;
        this.handle = handle;
    };

    Response.prototype = {
        send: function(data, options) {
            var opts = utils.defaultObject(options);
            try {
                this._setMeta(opts);
                var dt = utils.defaultJson(data);
                nativeLib.wiltoncall("request_send_response", JSON.stringify({
                    requestHandle: this.handle,
                    data: dt
                }));
                utils.callOrIgnore(opts.onSuccess);
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        },
        
        sendTempFile: function(filePath, options) {
            var opts = utils.defaultObject(options);
            try {
                this._setMeta(opts);
                nativeLib.wiltoncall("request_send_temp_file", JSON.stringify({
                    requestHandle: this.handle,
                    filePath: filePath
                }));
                utils.callOrIgnore(opts.onSuccess);
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        },
        
        sendMustache: function(filePath, values, options) {
            var opts = utils.defaultObject(options);
            try {
                this._setMeta(opts);
                var vals = utils.defaultObject(values);
                nativeLib.wiltoncall("request_send_mustache", JSON.stringify({
                    requestHandle: this.handle,
                    mustacheFilePath: this.server.mustacheTemplatesRootDir + filePath,
                    values: vals
                }));
                utils.callOrIgnore(opts.onSuccess);
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        },
        
        _setMeta: function(opts) {
            if ("object" === typeof (opts.meta) && null !== opts.meta) {
                nativeLib.wiltoncall("request_set_response_metadata", JSON.stringify({
                    requestHandle: this.handle,
                    metadata: opts.meta
                }));
            }
        }
    };


    // Server

    var Server = function(config) {
        var opts = utils.defaultObject(config);

        var _prepateViews = function(views) {
            if ("object" !== typeof (views)) {
                throw new Error("Invalid 'views' property");
            }
            if (views instanceof Array) {
                var res = {};
                for (var i = 0; i < views.length; i++) {
                    if ("object" !== typeof (views[i])) {
                        throw new Error("Invalid 'views' array, index: [" + i + "]");
                    }
                    for (var path in views[i]) {
                        var cb = views[i];
                        if (cb.hasOwnProperty(path)) {
                            if (res.hasOwnProperty(path)) {
                                throw new Error("Invalid 'views', duplicate path: [" + path + "]");
                            }
                            res[path] = cb[path];
                        }
                    }
                }
                return res;
            } else {
                return views;
            }
        };

        var onSuccess = opts.onSuccess;
        var onFailure = opts.onFailure;
        delete opts.onSuccess;
        delete opts.onFailure;
        try {
            this.logger = new Logger("wilton.server");
            this.gateway = opts.gateway;
            this.views = _prepateViews(opts.views);
            this.mustacheTemplatesRootDir = "";
            if ("undefined" !== typeof (opts.mustache) &&
                    "string" === typeof (opts.mustache.templatesRootDir)) {
                this.mustacheTemplatesRootDir = opts.mustache.templatesRootDir;
                delete opts.mustache.templatesRootDir;
            }
            var self = this;
            var gatewayPass = nativeLib.wrapWiltonGateway(function(requestHandle) {
                self._gatewaycb(requestHandle);
            });
            delete opts.views;
            var data = JSON.stringify(opts);
            var handleJson = nativeLib.wiltoncall("server_create", data, gatewayPass);
            var handleObj = JSON.parse(handleJson);
            this.handle = handleObj.serverHandle;
            utils.callOrIgnore(onSuccess);
        } catch (e) {
            utils.callOrThrow(onFailure, e);
        }
    };

    Server.prototype = {
        _gatewaycb: function(requestHandle) {
            try {
                var json = nativeLib.wiltoncall("request_get_metadata", JSON.stringify({
                    requestHandle: requestHandle
                }));
                var req = JSON.parse(json);
                var cb = null;
                if ("function" === typeof (this.gateway)) {
                    cb = gateway;
                } else {
                    cb = this.views[req.pathname];
                    if ("undefined" === typeof (cb)) {
                        nativeLib.wiltoncall("request_set_response_metadata", JSON.stringify({
                            requestHandle: requestHandle,
                            metadata: {
                                statusCode: 404,
                                statusMessage: "Not Found"
                            }
                        }));
                        nativeLib.wiltoncall("request_send_response", JSON.stringify({
                            requestHandle: requestHandle,
                            data: "404: Not Found: [" + req.pathname + "]"
                        }));
                        return;
                    }
                }
                req.data = "";
                if ("POST" === req.method || "PUT" === req.method) {
                    var bdata = nativeLib.wiltoncall("request_get_data", JSON.stringify({
                        requestHandle: requestHandle
                    }));
                    req.data = "" + bdata;
                }
                var resp = new Response(this, requestHandle);
                cb(req, resp);
            } catch (e) {
                this.logger.error(e);
                nativeLib.wiltoncall("request_set_response_metadata", JSON.stringify({
                    requestHandle: requestHandle,
                    metadata: {
                        statusCode: 500,
                        statusMessage: "Server Error"
                    }
                }));
                nativeLib.wiltoncall("request_send_response", JSON.stringify({
                    requestHandle: requestHandle,
                    data: "500: Server Error"
                }));
            }
        },
        
        stop: function(options) {
            var opts = utils.defaultObject(options);
            try {
                nativeLib.wiltoncall("server_stop", JSON.stringify({
                    serverHandle: this.handle
                }));
                utils.callOrIgnore(opts.onSuccess);
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        }
    };
    
    return Server;

});
