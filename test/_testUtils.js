/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["wilton/HttpClient", "wilton/shared"], function(HttpClient, shared) {
    "use strict";

    var http = new HttpClient();

    function closeHttpClient() {
        http.close();
    }

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
                forceHttp10: true,
                abortOnResponseError: false,
                connecttimeoutMillis: 500,
                timeoutMillis: 60000
            }
        });
        return resp.data;
    }
    
    function cronTestMethod() {
        var stored = shared.get({
            key: "CronTaskTest"
        });
        if (null !== stored) {
            stored.val += 1;
            shared.put({
                key: "CronTaskTest",
                value: stored
            });
        }
    }
    
    function threadTestMethod() {
        var stored = shared.get({
            key: "threadTest"
        });
        if (null !== stored) {
            stored.val += 1;
            shared.put({
                key: "threadTest",
                value: stored
            });
        }
    }
    
    function mutexTestMethod1() {
        var stored = shared.get({
            key: "mutexTest"
        });
        if (null !== stored) {
            stored.val += 1;
            shared.put({
                key: "mutexTest",
                value: stored
            });
        }
    }
    
    function mutexTestMethod2() {

    }
    
    function mutexTestMethod3() {

    }
    
    return {
        closeHttpClient: closeHttpClient,
        assert: assert,
        httpGet: httpGet,
        httpGetHeader: httpGetHeader,
        httpGetCode: httpGetCode,
        httpPost: httpPost,
        cronTestMethod: cronTestMethod,
        threadTestMethod: threadTestMethod
    };
});
