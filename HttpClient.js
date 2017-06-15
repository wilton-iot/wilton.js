/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./utils"], function(wiltoncall, utils) {
    "use strict";

    function HttpClient(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            if (utils.hasProperties(opts, ["handle"])) {
                utils.checkPropertyType(opts, "handle", "number");
                this.handle = opts.handle;
            } else {
                var json = wiltoncall("httpclient_create", opts);
                var out = JSON.parse(json);
                utils.checkPropertyType(out, "httpclientHandle", "number");
                this.handle = out.httpclientHandle;
            }
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    HttpClient.prototype = {
        execute: function(url, options, callback) {
            var opts = utils.defaultObject(options);
            try {
                var urlstr = utils.defaultString(url);
                var dt = "";
                if(!utils.undefinedOrNull(opts.data)) {
                    dt = utils.defaultJson(opts.data);
                }
                var meta = utils.defaultObject(opts.meta);
                var resp_json = wiltoncall("httpclient_execute", {
                    httpclientHandle: this.handle,
                    url: urlstr,
                    data: dt,
                    metadata: meta
                });
                var resp = JSON.parse(resp_json);
                utils.callOrIgnore(callback, resp);
                return resp;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },
        
        sendTempFile: function(url, options, callback) {
            var opts = utils.defaultObject(options);
            try {
                var urlstr = utils.defaultString(url);
                var fp = utils.defaultString(opts.filePath);
                var meta = utils.defaultObject(opts.meta);
                var resp_json = wiltoncall("httpclient_send_temp_file", {
                    httpclientHandle: this.handle,
                    url: urlstr,
                    filePath: fp,
                    metadata: meta
                });
                var resp = JSON.parse(resp_json);
                utils.callOrIgnore(callback, resp);
                return resp;
            } catch (e) {
                utils.callOrThrow(callback, e, {});
            }
        },
        
        close: function(options, callback) {
            var opts = utils.defaultObject(options);
            try {
                wiltoncall("httpclient_close", {
                    httpclientHandle: this.handle
                });
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }
    };

    return HttpClient;
});
