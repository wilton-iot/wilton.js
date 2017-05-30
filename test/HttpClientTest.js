/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["wilton/HttpClient", "wilton/Server", "./_testUtils"], function(HttpClient, Server, testUtils) {
    "use strict";

    var server = new Server({
        tcpPort: 8080,
        views: [
            "wilton/test/views/hi",
            "wilton/test/views/postmirror"
        ]
    });

    var http = new HttpClient();
    var resp = http.execute("http://127.0.0.1:8080/wilton/test/views/hi", {
        meta: {
            forceHttp10: true,
            timeoutMillis: 60000
        }
    });
    testUtils.assert("Hi from wilton_test!" === resp.data);
    testUtils.assert("close" === resp.headers.Connection);
    var resp = http.execute("http://127.0.0.1:8080/wilton/test/views/postmirror", {
        data: "foobar",
        meta: {
            forceHttp10: true,
            timeoutMillis: 60000
        }
    });
    testUtils.assert("foobar" === resp.data);
    http.close();

    server.stop();

});
