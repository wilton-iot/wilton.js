/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./utils"], function(wiltoncall, utils, Logger) {
    "use strict";
    
    var Request = function(requestHandle) {
        this.handle = requestHandle;
        this.metaCached = null;
        this.dataCached = null;
        this.jsonCached = null;
        this.dataFilenameCached = null;
    };
    
    Request.prototype = {
        meta: function(callback) {
            try {
                if (null === this.metaCached) {
                    var json = wiltoncall("request_get_metadata", {
                        requestHandle: this.handle
                    });
                    this.metaCached = JSON.parse(json);
                }
                utils.callOrIgnore(callback, this.metaCached);
                return this.metaCached;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },
        
        data: function(callback) {
            try {
                if (null === this.dataCached) {
                    this.dataCached = wiltoncall("request_get_data", {
                        requestHandle: this.handle
                    });
                }
                utils.callOrIgnore(callback, this.dataCached);
                return this.dataCached;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },
        
        json: function(callback) {
            try {
                if (null === this.jsonCached) {
                    var json = this.data();
                    this.jsonCached = JSON.parse(json);
                }
                utils.callOrIgnore(callback, this.jsonCached);
                return this.jsonCached;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },
        
        dataFilename: function(callback) {
            try {
                if (null === this.dataFilenameCached) {
                    this.dataFilenameCached = wiltoncall("request_get_data_filename", {
                        requestHandle: this.handle
                    });
                }
                utils.callOrIgnore(callback, this.dataFilenameCached);
                return this.dataFilenameCached;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },
        
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
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },
        
        sendTempFile: function(filePath, options, callback) {
            var opts = utils.defaultObject(options);
            try {
                this._setMeta(opts);
                wiltoncall("request_send_temp_file", {
                    requestHandle: this.handle,
                    filePath: filePath
                });
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },
        
        sendMustache: function(filePath, values, options, callback) {
            var opts = utils.defaultObject(options);
            try {
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
                    mustacheFilePath: filePath,
                    values: vals
                });
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
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
