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
        var zippath = misc.wiltonConfig().requireJs.baseUrl;
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
            "wilton/test/views/respmustache",
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
    assert.equal(clientHelper.httpGetCode(prefix + "foo", meta), 404);
    assert.equal(clientHelper.httpGet(prefix + "hi", meta), "Hi from wilton_test!");
    var getjson = clientHelper.httpGet(prefix + "respjson", meta);
    var getresp = JSON.parse(getjson);
    assert.equal(getresp.foo, 1);
    assert.equal(clientHelper.httpGetHeader(prefix + "respjson", "Content-Type", meta), "application/json");
    var html = clientHelper.httpGet(prefix + "respmustache", meta);
    assert(-1 !== html.indexOf("Hi Chris! Hi Mark! Hi Scott!"));
    assert.equal(clientHelper.httpGetHeader(prefix + "respmustache", "Content-Type", meta), "text/html");
    assert.equal(getresp.bar, "baz");
    assert.equal(clientHelper.httpGet(prefix + "resperror", meta), "Error triggered");
    assert.equal(clientHelper.httpGet(prefix + "reqheader", meta), "localhost:8443");
    assert.equal(clientHelper.httpGet(prefix + "respfooheader", meta), "header set");
    assert.equal(clientHelper.httpGetHeader(prefix + "respfooheader", "X-Foo", meta), "foo");
    assert.equal(clientHelper.httpPost(prefix + "postmirror", "foobar", meta), "foobar");
    assert.equal(clientHelper.httpGet(prefix + "filtered", meta), "filtered OK");

    // optional
    server.stop();
    
});
