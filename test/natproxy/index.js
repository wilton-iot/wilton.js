/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "assert",
    "wilton/shared",
    "wilton/CronTask",
    "wilton/httpClient",
    "wilton/Server",
    "wilton/thread",
    "wilton/wiltoncall",
    "wilton/misc"
], function(assert, shared, CronTask, http, Server, thread, wiltoncall, misc) {   
    "use strict";
    
    print("test: wilton.natproxy ...");
    // config, in app will come from outside
    var config = {
        dbUrl: "postgresql://host=127.0.0.1 port=5432 dbname=test user=test password=test",
//        dbUrl: "sqlite://test.db",
        emptyStatusCode: 204,
        timeoutStatusCode: 504,
        waitTimeoutMillis: 30000,
        maxRequestRecords: 8
    };
    
    // context        
    shared.put("wilton.test.natproxy.config", config);
    
    // destination server
    var serverDest = new Server({
        tcpPort: 8080,
        views: [
            "wilton/test/natproxy/views/server"
        ]
    });
    
    // destination server endpoint
    wiltoncall("natproxy_register_endpoint", {
        name: "server1",
        queueTtlMillis: config.waitTimeoutMillis
    });
    
    var certdir = misc.getModulePath("wilton/test/certificates/");
    
    // proxy server
    var serverProxy = new Server({
        tcpPort: 8444,
        views: [
            "wilton/test/natproxy/views/gateway",
            "wilton/test/natproxy/views/requests",
            "wilton/test/natproxy/views/response"
        ],
        ssl: {
            keyFile: certdir + "server/localhost.pem",
            keyPassword: "test",
            verifyFile: certdir + "server/staticlibs_test_ca.cer",
            verifySubjectSubstr: "CN=testclient"
        }
    });   
    
    var agent_proxy_meta = {
        connecttimeoutMillis: 10000,
        timeoutMillis: 30000,
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
    
    // agent task
    var cron = new CronTask({
        expression: "* * * * * *",
        callbackScript: {
            module: "wilton/natproxy/agent",
            func: "agentJob",
            args: [{
                proxyGetUrl: "https://localhost:8444/wilton/test/natproxy/views/requests",
                proxyGetMetadata: agent_proxy_meta,
                proxyPostUrl: "https://localhost:8444/wilton/test/natproxy/views/response",
                proxyPostMetadata: agent_proxy_meta,
                endpointName: "server1",
                endpointBaseUrl: "http://127.0.0.1:8080",
                endpointRequestMetadata: {}
            }]
        }
    });
    

    // make requests
    var optsDirect = {
        meta: {
            headers: {
                "X-Test-Foo": "Bar"
            },
            timeoutMillis: 60000
        }
    };
    var optsProxy = {
        meta: {
            headers: {
                "X-Test-Foo": "Bar"
            },
            timeoutMillis: 60000,
            sslcertFilename: certdir + "client/testclient.pem",
            sslcertype: "PEM",
            sslkeyFilename: certdir + "client/testclient.pem",
            sslKeyType: "PEM",
            sslKeypasswd: "test",
            requireTls: true,
            sslVerifyhost: true,
            sslVerifypeer: true,
            cainfoFilename: certdir + "client/staticlibs_test_ca.cer"
        }
    };
    var directUrl = "http://127.0.0.1:8080/wilton/test/natproxy/views/server";
    var proxiedUrl = "https://localhost:8444/wilton/test/natproxy/views/gateway?endpoint=server1&path=%2Fwilton%2Ftest%2Fnatproxy%2Fviews%2Fserver";
    // get
    {        
        print("test: GET");
        var direct = http.sendRequest(directUrl, optsDirect);
        var proxied = http.sendRequest(proxiedUrl, optsProxy);
        assert.equal(direct.data, proxied.data);
    }
    
    var postData = {
        sender: "client"
    };
    
    // post
    {
        print("test: POST");
        optsDirect.meta.method = "POST";
        optsProxy.meta.method = "POST";
        optsDirect.data = postData;
        optsProxy.data = postData;
        var direct = http.sendRequest(directUrl, optsDirect);
        var proxied = http.sendRequest(proxiedUrl, optsProxy);
        assert.equal(direct.data, proxied.data);
    }
    
    // put
    {
        print("test: PUT");
        optsDirect.meta.method = "PUT";
        optsProxy.meta.method = "PUT";
        var direct = http.sendRequest(directUrl, optsDirect);
        var proxied = http.sendRequest(proxiedUrl, optsProxy);        
        assert.equal(direct.data, proxied.data);
    }
    
    // delete
    {
        print("test: DELETE");
        optsDirect.meta.method = "DELETE";
        optsProxy.meta.method = "DELETE";
        delete optsDirect.data;
        delete optsProxy.data;
        var direct = http.sendRequest(directUrl, optsDirect);
        var proxied = http.sendRequest(proxiedUrl, optsProxy);
        assert.equal(direct.data, proxied.data);
    }
    
    // shutdown, optional
    cron.stop();
    serverDest.stop();
    serverProxy.stop();
    
    print("test: wilton.natproxy passed");
});
