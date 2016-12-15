/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./nativeLib", "./utils"], function(nativeLib, utils) {
    "use strict";

    var HttpClient = function(config) {
        var opts = utils.defaultObject(config);
        var onSuccess = opts.onSuccess;
        var onFailure = opts.onFailure;
        delete opts.onSuccess;
        delete opts.onFailure;
        try {
            var data = JSON.stringify(opts);
            var json = nativeLib.wiltoncall("httpclient_create", data);
            var out = JSON.parse(json);
            this.handle = out.httpclientHandle;
            utils.callOrIgnore(onSuccess);
        } catch (e) {
            utils.callOrThrow(onFailure, e);
        }
    };

    HttpClient.prototype = {
        execute: function(url, options) {
            var opts = utils.defaultObject(options);
            try {
                var urlstr = utils.defaultString(url);
                var dt = "";
                if(!utils.undefinedOrNull(opts.data)) {
                    dt = utils.defaultJson(opts.data);
                }
                var meta = utils.defaultObject(opts.meta);
                var resp_json = nativeLib.wiltoncall("httpclient_execute", JSON.stringify({
                    httpclientHandle: this.handle,
                    url: urlstr,
                    data: dt,
                    metadata: meta
                }));
                var resp = JSON.parse(resp_json);
                utils.callOrIgnore(opts.onSuccess, resp);
                return resp;
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        },
        
        sendTempFile: function(url, options) {
            var opts = utils.defaultObject(options);
            try {
                var urlstr = utils.defaultString(url);
                var fp = utils.defaultString(opts.filePath);
                var meta = utils.defaultObject(opts.meta);
                var resp_json = nativeLib.wiltoncall("httpclient_send_temp_file", JSON.stringify({
                    httpclientHandle: this.handle,
                    url: urlstr,
                    filePath: fp,
                    metadata: meta
                }));
                var resp = JSON.parse(resp_json);
                utils.callOrIgnore(opts.onSuccess, resp);
                return resp;
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e, {});
            }
        },
        
        close: function(options) {
            var opts = utils.defaultObject(options);
            try {
                nativeLib.wiltoncall("httpclient_close", JSON.stringify({
                    httpclientHandle: this.handle
                }));
                utils.callOrIgnore(opts.onSuccess);
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        }
    };

    return HttpClient;
});
