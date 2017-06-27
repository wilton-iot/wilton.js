/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([
    "assert",
    "wilton/httpClient",
    "wilton/shared"
], function(assert, http, shared) {
    "use strict";

    function httpGet(url) {
        var resp = http.sendRequest(url, {
            meta: {
                method: "GET",
                abortOnResponseError: false,
                connecttimeoutMillis: 500,
                timeoutMillis: 60000
            }
        });
        return resp.data;
    }

    function httpGetHeader(url, header) {
        var resp = http.sendRequest(url, {
            meta: {
                method: "GET",
                abortOnResponseError: false,
                connecttimeoutMillis: 500,
                timeoutMillis: 60000
            }
        });
        return resp.headers[header];
    }

    function httpGetCode(url) {
        var resp = http.sendRequest(url, {
            meta: {
                method: "GET",
                abortOnResponseError: false,
                connecttimeoutMillis: 500,
                timeoutMillis: 60000
            }
        });
        return resp.responseCode;
    }

    function httpPost(url, data) {
        var resp = http.sendRequest(url, {
            data: data,
            meta: {
                method: "POST",
                abortOnResponseError: false,
                connecttimeoutMillis: 500,
                timeoutMillis: 60000
            }
        });
        return resp.data;
    }

    function postAndIncrement() {
        for (var i = 0; i < 10; i++) {
            var resp = http.sendRequest("http://127.0.0.1:8080/wilton/test/core/views/postmirror", {
                data: "foobar",
                meta: {
                    timeoutMillis: 60000
                }
            });
            assert("foobar" === resp.data);
            shared.listAppend("clientTest", resp);
        }
    }

    return {
        httpGet: httpGet,
        httpGetHeader: httpGetHeader,
        httpGetCode: httpGetCode,
        httpPost: httpPost,
        postAndIncrement: postAndIncrement
    };
});

