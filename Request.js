/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./utils"], function(utils, Logger) {
    "use strict";
    
    var Request = function(requestHandle) {
        this.handle = requestHandle;
    };
    
    Request.prototype = {
        getMetadata: function(options) {
            var opts = utils.defaultObject(options);
            try {
                var json = wiltoncall("request_get_metadata", JSON.stringify({
                    requestHandle: this.handle
                }));
                var res = JSON.parse(json);
                utils.callOrIgnore(opts.onSuccess, res);
                return res;
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        },
        
        getData: function(options) {
            var opts = utils.defaultObject(options);
            try {
                var res = wiltoncall("request_get_data", JSON.stringify({
                    requestHandle: this.handle
                }));
                utils.callOrIgnore(opts.onSuccess, res);
                return res;
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        },
        
        getDataFilename: function(options) {
            var opts = utils.defaultObject(options);
            try {
                var res = wiltoncall("request_get_data_filename", JSON.stringify({
                    requestHandle: this.handle
                }));
                utils.callOrIgnore(opts.onSuccess, res);
                return res;
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        },
        
        sendResponse: function(data, options) {
            var opts = utils.defaultObject(options);
            try {
                this._setMeta(opts);
                var dt = utils.defaultJson(data);
                wiltoncall("request_send_response", JSON.stringify({
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
                wiltoncall("request_send_temp_file", JSON.stringify({
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
                wiltoncall("request_send_mustache", JSON.stringify({
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
                wiltoncall("request_set_response_metadata", JSON.stringify({
                    requestHandle: this.handle,
                    metadata: opts.meta
                }));
            }
        }
    };

    return Request;
});
