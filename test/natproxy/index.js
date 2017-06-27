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
    "wilton/wiltoncall"
], function(assert, shared, CronTask, http, Server, thread, wiltoncall) {   
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
    
    // proxy server
    var serverProxy = new Server({
        numberOfThreads: 8,
        tcpPort: 8081,
        views: [
            "wilton/test/natproxy/views/gateway",
            "wilton/test/natproxy/views/requests",
            "wilton/test/natproxy/views/response"
        ]
    });   
    
    // agent task
    var cron = new CronTask({
        expression: "* * * * * *",
        callbackScript: {
            module: "wilton/natproxy/agent",
            func: "agentJob",
            args: [{
                proxyGetUrl: "http://127.0.0.1:8081/wilton/test/natproxy/views/requests",
                proxyGetMetadata: {
                    connecttimeoutMillis: 10000,
                    timeoutMillis: 30000
                },
                proxyPostUrl: "http://127.0.0.1:8081/wilton/test/natproxy/views/response",
                proxyPostMetadata: {},
                endpointName: "server1",
                endpointBaseUrl: "http://127.0.0.1:8080",
                endpointRequestMetadata: {}
            }]
        }
    });
    

    // make requests
    var opts = {
        meta: {
            headers: {
                "X-Test-Foo": "Bar"
            },
            timeoutMillis: 60000
        }
    };
    var directUrl = "http://127.0.0.1:8080/wilton/test/natproxy/views/server";
    var proxiedUrl = "http://127.0.0.1:8081/wilton/test/natproxy/views/gateway?endpoint=server1&path=%2Fwilton%2Ftest%2Fnatproxy%2Fviews%2Fserver";
    // get
    {        
        print("test: GET");
        var direct = http.sendRequest(directUrl, opts);
        var proxied = http.sendRequest(proxiedUrl, opts);
        assert.equal(direct.data, proxied.data);
    }

    // post
    {
        print("test: POST");
        opts.meta.method = "POST";
        opts.data = {
            sender: "client"
        };
        var direct = http.sendRequest(directUrl, opts);
        var proxied = http.sendRequest(proxiedUrl, opts);
        assert.equal(direct.data, proxied.data);
    }
    
    // put
    {
        print("test: PUT");
        opts.meta.method = "PUT";
        var direct = http.sendRequest(directUrl, opts);
        var proxied = http.sendRequest(proxiedUrl, opts);        
        assert.equal(direct.data, proxied.data);
    }
    // delete
    {
        print("test: DELETE");
        opts.meta.method = "DELETE";
        delete opts.data;
        var direct = http.sendRequest(directUrl, opts);
        var proxied = http.sendRequest(proxiedUrl, opts);
        assert.equal(direct.data, proxied.data);
    }
    
    // shutdown, optional
    cron.stop();
    serverDest.stop();
    serverProxy.stop();
    
    print("test: wilton.natproxy passed");
});
