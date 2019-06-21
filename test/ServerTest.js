/*
 * Copyright 2017, alex at staticlibs.net
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define([
    "assert",
    "wilton/Channel",
    "wilton/Server",
    "wilton/loader",
    "wilton/thread",
    "wilton/test/helpers/httpClientHelper"
], function(assert, Channel, Server, loader, thread, clientHelper) {
    "use strict";

    print("test: wilton/Server");

    var certdir = loader.findModulePath("wilton/test/certificates/");

    // worker and channel for delayed reponses
    var delayedChannel = new Channel("ServerTest_delayed");
    thread.run({
        callbackScript: {
            module: "wilton/test/helpers/delayedRequestsWorker",
            args: ["ServerTest_delayed"]
        }
    });

    var server = new Server({
        tcpPort: 8443,
        views: [
            "wilton/test/views/hi",
            "wilton/test/views/postmirror",
            "wilton/test/views/reqheader",
            "wilton/test/views/reqform",
            "wilton/test/views/resperror",
            "wilton/test/views/respfooheader",
            "wilton/test/views/respjson",
            "wilton/test/views/respmustache",
            "wilton/test/views/filtered",
            "wilton/test/views/delayed",
            "wilton/test/views/metaaftercommit"
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
        },
        rootRedirectLocation: "/wilton/test/views/hi"
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
    assert.equal(clientHelper.httpGet("https://localhost:8443/", meta), "Hi from wilton_test!");
    var getjson = clientHelper.httpGet(prefix + "respjson", meta);
    var getresp = JSON.parse(getjson);
    assert.equal(getresp.foo, 1);
    assert.equal(clientHelper.httpGetHeader(prefix + "respjson", "Content-Type", meta), "application/json");
    assert(-1 !== clientHelper.httpGet(prefix + "respmustache", meta).indexOf("Hi Chris! Hi Mark! Hi Scott!"));
    assert.equal(clientHelper.httpGetHeader(prefix + "respmustache", "Content-Type", meta), "text/html");
    assert.equal(getresp.bar, "baz");
    assert.equal(clientHelper.httpGet(prefix + "resperror", meta), "Error triggered");
    assert.equal(clientHelper.httpGet(prefix + "reqheader", meta), "localhost:8443");
    var formObj = {
        foo: "bar",
        baz: "42"
    };
    assert.deepEqual(JSON.parse(clientHelper.httpPost(prefix + "reqform", "foo=bar&baz=42", meta)), formObj);
    assert.equal(clientHelper.httpGet(prefix + "respfooheader", meta), "header set");
    assert.equal(clientHelper.httpGetHeader(prefix + "respfooheader", "X-Foo", meta), "foo");
    assert.equal(clientHelper.httpPost(prefix + "postmirror", "foobar", meta), "foobar");
    assert.equal(clientHelper.httpGet(prefix + "filtered", meta), "filtered OK");
    assert.equal(clientHelper.httpGet(prefix + "delayed", meta), "delayed OK");
    assert.equal(clientHelper.httpGetHeader(prefix + "delayed", "X-Test-Delayed", meta), "true");
    assert.equal(clientHelper.httpGet(prefix + "metaaftercommit", meta), "metaaftercommit");

    // optional
    server.stop();
    delayedChannel.close();

});
