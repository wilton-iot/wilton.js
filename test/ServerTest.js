/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "assert",
    "wilton/fs",
    "wilton/Server",
    "wilton/loader",
    "wilton/misc",
    "wilton/test/helpers/httpClientHelper"
], function(assert, fs, Server, loader, misc, clientHelper) {
    "use strict";

    print("test: wilton/Server");

    var certdir = loader.findModulePath("wilton/test/certificates/");
    // check path exists
    var checkpath = certdir + "server/localhost.pem";
    if (!fs.exists(checkpath)) {
        // fallback for the case when tests are run from zip file
        var zippath = misc.getWiltonConfig().requireJs.baseUrl;
        var parenturl = zippath.replace(/\/[^/]+$/g, "");
        var parentpath = parenturl.replace(/^\w+?\:\/\//g, "");
        certdir = parentpath + "/wilton_core/test/certificates/";
    }
    
    var server = new Server({
        tcpPort: 8443,
        views: [
            "wilton/test/views/hi",
            "wilton/test/views/postmirror",
            "wilton/test/views/reqheader",
            "wilton/test/views/resperror",
            "wilton/test/views/respfooheader",
            "wilton/test/views/respjson",
            "wilton/test/views/filtered"
        ],
        filters: [
            "wilton/test/helpers/serverFilter1Helper",
            "wilton/test/helpers/serverFilter2Helper"
        ],
        ssl: {
            keyFile: certdir + "server/localhost.pem",
            keyPassword: "test",
            verifyFile: certdir + "server/staticlibs_test_ca.cer",
            verifySubjectSubstr: "CN=testclient"
        }
    });      
    
    var meta = {
        sslcertFilename: certdir + "client/testclient.pem",
        sslcertype: "PEM",
        sslkeyFilename: certdir + "client/testclient.pem",
        sslKeyType: "PEM",
        sslKeypasswd: "test",
        requireTls: true,
        sslVerifyhost: true,
        sslVerifypeer: true,
        cainfoFilename: certdir + "client/staticlibs_test_ca.cer"
    };

    var prefix = "https://localhost:8443/wilton/test/views/";
    assert(404 === clientHelper.httpGetCode(prefix + "foo", meta));
    assert("Hi from wilton_test!" === clientHelper.httpGet(prefix + "hi", meta));
    var getjson = clientHelper.httpGet(prefix + "respjson", meta);
    var getresp = JSON.parse(getjson);
    assert(1 === getresp.foo);
    assert("baz" === getresp.bar);
    assert("Error triggered" === clientHelper.httpGet(prefix + "resperror", meta));
    assert("localhost:8443" === clientHelper.httpGet(prefix + "reqheader", meta));
    assert("header set" === clientHelper.httpGet(prefix + "respfooheader", meta));
    assert("foo" === clientHelper.httpGetHeader(prefix + "respfooheader", "X-Foo", meta));
    assert("foobar" === clientHelper.httpPost(prefix + "postmirror", "foobar", meta));
    assert("filtered OK" === clientHelper.httpGet(prefix + "filtered", meta));

    // optional
    server.stop();
    
});
