/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./hex", "./wiltoncall", "./utils"], function(hex, wiltoncall, utils) {
    "use strict";

    function sendRequest(url, options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var urlstr = utils.defaultString(url);
            var dt = "";
            if (!utils.undefinedOrNull(opts.data)) {
                dt = utils.defaultJson(opts.data);
            }
            var meta = utils.defaultObject(opts.meta);
            var resp_json = wiltoncall("httpclient_send_request", {
                url: urlstr,
                data: dt,
                metadata: meta
            });
            var resp = JSON.parse(resp_json);
            resp.data = hex.decodeUTF8(resp.dataHex);
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    function sendFile(url, options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var urlstr = utils.defaultString(url);
            var fp = utils.defaultString(opts.filePath);
            var meta = utils.defaultObject(opts.meta);
            var resp_json = wiltoncall("httpclient_send_file", {
                url: urlstr,
                filePath: fp,
                metadata: meta,
                remove: true === opts.remove
            });
            var resp = JSON.parse(resp_json);
            resp.data = hex.decodeUTF8(resp.dataHex);
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return {
        sendRequest: sendRequest,
        sendFile: sendFile
    };
});
