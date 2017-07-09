/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "assert",
    "wilton/fs",
    "wilton/httpClient",
    "wilton/Server",
    "wilton/shared",
    "wilton/thread"
], function(assert, fs, http, Server, shared, thread) {
    "use strict";

    var server = new Server({
        tcpPort: 8080,
        views: [
            "wilton/test/core/views/hi",
            "wilton/test/core/views/postmirror"
        ]
    });

    var resp = http.sendRequest("http://127.0.0.1:8080/wilton/test/core/views/hi", {
        meta: {
            forceHttp10: true,
            timeoutMillis: 60000
        }
    });
    assert("Hi from wilton_test!" === resp.data);
    assert("close" === resp.headers.Connection);
    
    var resp = http.sendRequest("http://127.0.0.1:8080/wilton/test/core/views/postmirror", {
        data: "foobar",
        meta: {
            timeoutMillis: 60000
        }
    });
    assert("foobar" === resp.data);

    // threads
    shared.put("clientTest", []);
    
    var num_workers = 2;
    var target = num_workers * 10;
    
    for (var i = 0; i < num_workers; i++) {
        thread.run({
            callbackScript: {
                "module": "wilton/test/core/helpers/httpClientHelper",
                "func": "postAndIncrement"
            }
        });
    }

    for(;;) {
        var count = shared.get("clientTest").length;
        print("waiting, count: [" + count + "] of: [" + target + "]");
        if (target === count) {
            break;
        }
        thread.sleepMillis(1000);
    }

    // response data to file
    var resp = http.sendRequest("http://127.0.0.1:8080/wilton/test/core/views/postmirror", {
        data: "foobaz",
        meta: {
            timeoutMillis: 60000,
            responseDataFilePath: "httpClientTest.response"
        }
    });
    var data_obj = JSON.parse(resp.data);
    assert("httpClientTest.response" === data_obj.responseDataFilePath);
    var contents = fs.readFile({
        path: "httpClientTest.response"
    });
    assert("foobaz" === contents);

    shared.remove("clientTest");
    server.stop();

});
