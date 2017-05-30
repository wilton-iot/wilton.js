/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["wilton/Server", "./_testUtils"], function(Server, testUtils) {
    "use strict";

    var server = new Server({
        tcpPort: 8080,
        views: [
            "wilton/test/views/hi",
            "wilton/test/views/postmirror",
            "wilton/test/views/reqheader",
            "wilton/test/views/resperror",
            "wilton/test/views/respfooheader",
            "wilton/test/views/respjson"
        ]
    });

    var prefix = "http://127.0.0.1:8080/wilton/test/views/";
    testUtils.assert(404 === testUtils.httpGetCode(prefix + "foo"));
    testUtils.assert("Hi from wilton_test!" === testUtils.httpGet(prefix + "hi"));
    testUtils.assert("{\"foo\":1,\"bar\":\"baz\"}" === testUtils.httpGet(prefix + "respjson"));
    testUtils.assert("Error triggered" === testUtils.httpGet(prefix + "resperror"));
    testUtils.assert("127.0.0.1:8080" === testUtils.httpGet(prefix + "reqheader"));
    testUtils.assert("header set" === testUtils.httpGet(prefix + "respfooheader"));
    testUtils.assert("foo" === testUtils.httpGetHeader(prefix + "respfooheader", "X-Foo"));
    testUtils.assert("foobar" === testUtils.httpPost(prefix + "postmirror", "foobar"));

    server.stop();

});
