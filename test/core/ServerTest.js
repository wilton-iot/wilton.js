/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "assert",
    "wilton/Server",
    "wilton/test/core/helpers/httpClientHelper"
], function(assert, Server, clientHelper) {
    "use strict";

    var server = new Server({
        tcpPort: 8088,
        views: [
            "wilton/test/core/views/hi",
            "wilton/test/core/views/postmirror",
            "wilton/test/core/views/reqheader",
            "wilton/test/core/views/resperror",
            "wilton/test/core/views/respfooheader",
            "wilton/test/core/views/respjson"
        ]
    });

    var prefix = "http://127.0.0.1:8088/wilton/test/core/views/";
    assert(404 === clientHelper.httpGetCode(prefix + "foo"));
    assert("Hi from wilton_test!" === clientHelper.httpGet(prefix + "hi"));
    var getjson = clientHelper.httpGet(prefix + "respjson");
    var getresp = JSON.parse(getjson);
    assert(1 === getresp.foo);
    assert("baz" === getresp.bar);
    assert("Error triggered" === clientHelper.httpGet(prefix + "resperror"));
    assert("127.0.0.1:8088" === clientHelper.httpGet(prefix + "reqheader"));
    assert("header set" === clientHelper.httpGet(prefix + "respfooheader"));
    assert("foo" === clientHelper.httpGetHeader(prefix + "respfooheader", "X-Foo"));
    assert("foobar" === clientHelper.httpPost(prefix + "postmirror", "foobar"));

    // optional
    server.stop();

});
