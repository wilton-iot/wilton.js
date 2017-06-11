/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["wilton/HttpClient", "wilton/shared"], function(HttpClient, shared) {
    "use strict";
    
    var http = shared.getFromHandle(HttpClient);

    function assert(value) {
        if (true !== value) {
            throw new Error("Assertion error");
        }
    }
    
    function httpGet(url) {
        var resp = http.execute(url, {
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
        var resp = http.execute(url, {
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
        var resp = http.execute(url, {
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
        var resp = http.execute(url, {
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
    
    function cronTestMethod() {
        var stored = shared.get("CronTaskTest");
        if (null !== stored) {
            stored.val += 1;
            shared.put({
                key: "CronTaskTest",
                value: stored
            });
        }
    }
    
    function threadTestMethod() {
        var stored = shared.get("threadTest");
        if (null !== stored) {
            stored.val += 1;
            shared.put({
                key: "threadTest",
                value: stored
            });
        }
    }
    
    function clientTestMethod() {
        var http = shared.getFromHandle(HttpClient);
        for (var i = 0; i < 10; i++) {
            var resp = http.execute("http://127.0.0.1:8080/wilton/test/views/postmirror", {
                data: "foobar",
                meta: {
                    timeoutMillis: 60000
                }
            });
            assert("foobar" === resp.data);
        
            var stored = shared.get("clientTest");
            if (null !== stored) {
                stored.val += 1;
                shared.put({
                    key: "clientTest",
                    value: stored
                });
            }
        }
    }
    
    return {
        assert: assert,
        httpGet: httpGet,
        httpGetHeader: httpGetHeader,
        httpGetCode: httpGetCode,
        httpPost: httpPost,
        cronTestMethod: cronTestMethod,
        threadTestMethod: threadTestMethod,
        clientTestMethod: clientTestMethod
    };
});
