/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "wilton/HttpClient",
    "wilton/Server",
    "wilton/shared",
    "wilton/thread",
    "./_testUtils"
], function(HttpClient, Server, shared, thread, testUtils) {
    "use strict";
    var assert = testUtils.assert;

    var server = new Server({
        tcpPort: 8080,
        views: [
            "wilton/test/views/hi",
            "wilton/test/views/postmirror"
        ]
    });

    var http = shared.getFromHandle(HttpClient);
    
    var resp = http.execute("http://127.0.0.1:8080/wilton/test/views/hi", {
        meta: {
            forceHttp10: true,
            timeoutMillis: 60000
        }
    });
    assert("Hi from wilton_test!" === resp.data);
    assert("close" === resp.headers.Connection);
    
    var resp = http.execute("http://127.0.0.1:8080/wilton/test/views/postmirror", {
        data: "foobar",
        meta: {
            timeoutMillis: 60000
        }
    });
    assert("foobar" === resp.data);

    // threads
    shared.put({
       key: "clientTest",
       value: {
           val:0
       }
    });
    
    var num_workers = 2;
    var target = num_workers * 10;
    
    for (var i = 0; i < num_workers; i++) {
        thread.run({
            callbackScript: {
                "module": "wilton/test/_testUtils",
                "func": "clientTestMethod",
                "args": []
            }
        });
    }

    for(;;) {
        var count = shared.get("clientTest").val;
        print("waiting, count: [" + count + "] of: [" + target + "]");
        if (target === count) {
            break;
        }
        thread.sleepMillis(1000);
    }

    shared.remove("clientTest");
    server.stop();

});
