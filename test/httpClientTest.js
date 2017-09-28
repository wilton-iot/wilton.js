/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "assert",
    "wilton/Channel",
    "wilton/fs",
    "wilton/httpClient",
    "wilton/Server",
    "wilton/thread"
], function(assert, Channel, fs, http, Server, thread) {
    "use strict";

    print("test: wilton/httpClient");

    var server = new Server({
        tcpPort: 8080,
        views: [
            "wilton/test/views/hi",
            "wilton/test/views/postmirror"
        ]
    });

    var resp = http.sendRequest("http://127.0.0.1:8080/wilton/test/views/hi", {
        meta: {
            forceHttp10: true,
            timeoutMillis: 60000
        }
    });
    assert.equal(resp.data, "Hi from wilton_test!");
    assert.equal(resp.headers.Connection, "close");
    
    var resp = http.sendRequest("http://127.0.0.1:8080/wilton/test/views/postmirror", {
        data: "foobar",
        meta: {
            timeoutMillis: 60000
        }
    });
    assert.equal(resp.data, "foobar");

    // threads
    var chan = new Channel({
        name: "clientTest",
        size: 64
    });
    
    var num_workers = 2;
    var target = num_workers * 10;
    
    for (var i = 0; i < num_workers; i++) {
        thread.run({
            callbackScript: {
                "module": "wilton/test/helpers/httpClientHelper",
                "func": "postAndIncrement"
            }
        });
    }

    for(var count = 0; count < target; count++) {
        var msg = chan.receive();
        assert.deepEqual(msg, {
            data: "foobar"
        });
        print("test: wilton/httpClient, waiting, count: [" + count + "] of: [" + target + "]");
    }
    chan.close();

    // response data to file
    var resp = http.sendRequest("http://127.0.0.1:8080/wilton/test/views/postmirror", {
        data: "foobaz",
        meta: {
            timeoutMillis: 60000,
            responseDataFilePath: "httpClientTest.response"
        }
    });
    var data_obj = JSON.parse(resp.data);
    assert.equal(data_obj.responseDataFilePath, "httpClientTest.response");
    var contents = fs.readFile("httpClientTest.response");
    assert.equal(contents, "foobaz");

    // send file
    fs.writeFile("clientTestSend.txt", "foobaf");
    var respFile = http.sendFile("http://127.0.0.1:8080/wilton/test/views/postmirror", {
        filePath: "clientTestSend.txt",
        meta: {
            timeoutMillis: 60000
        }
    });
    assert.equal(respFile.data, "foobaf");
    assert(fs.exists("clientTestSend.txt"));
    fs.unlink("clientTestSend.txt");
    assert(!fs.exists("clientTestSend.txt"));
    
    server.stop();

});
