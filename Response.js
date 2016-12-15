/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./nativeLib", "./utils"], function(nativeLib, utils, Logger) {
    "use strict";
    
    var Response = function(requestHandle) {
        this.handle = requestHandle;
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

    return Response;
});
