/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "wilton/shared",
    "wilton/CronTask",
    "wilton/Server",
    "wilton/HttpClient",
    "wilton/db/connManager",
    "wilton/thread",
    "wilton/wiltoncall"
], function(shared, CronTask, Server, HttpClient, connManager, thread, wiltoncall) {   
    "use strict";
    
    // config, in app will come from outside
    var config = {
        connManagerKey: "wilton.test.natproxy.connManager",
        httpClientKey: "wilton.test.natproxy.httpClient",
        dbUrl: "postgresql://host=127.0.0.1 port=5432 dbname=test user=test password=test",
        emptyStatusCode: 204,
        timeoutStatusCode: 504,
        waitTimeoutMillis: 10000
    };
    
    // context        
    shared.put("wilton.test.natproxy.config", config);
    var client = new HttpClient();
    shared.put(config.httpClientKey, {
        handle: client.handle
    });        
    
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
                clientHandle: client.handle,
                proxyGetUrl: "http://127.0.0.1:8081/wilton/test/natproxy/views/requests",
                proxyPostUrl: "http://127.0.0.1:8081/wilton/test/natproxy/views/response",
                endpointName: "server1",
                endpointBaseUrl: "http://127.0.0.1:8080"
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
        var direct = client.execute(directUrl, opts);
        print("GET direct: [" + direct.data + "]");
        var proxied = client.execute(proxiedUrl, opts);
        print("GET proxied: [" + proxied.data + "]");
    }
    // post
//    {
//        opts.meta.method = "POST";
//        opts.data = {
//            sender: "client"
//        };
//        var direct = client.execute(directUrl, opts);
//        print("POST direct: [" + direct.data + "]");
//        var proxied = client.execute(proxiedUrl, opts);
//        print("POST proxied: [" + proxied.data + "]");
//    }
//    // put
//    {
//        opts.meta.method = "PUT";
//        var direct = client.execute(directUrl, opts);
//        print("PUT direct: [" + direct.data + "]");
//        var proxied = client.execute(proxiedUrl, opts);
//        print("PUT proxied: [" + proxied.data + "]");
//    }
//    // delete
//    {
//        opts.meta.method = "DELETE";
//        delete opts.data;
//        var direct = client.execute(directUrl, opts);
//        print("DELETE direct: [" + direct.data + "]");
//        var proxied = client.execute(proxiedUrl, opts);
//        print("DELETE proxied: [" + proxied.data + "]");
//    }

//    thread.sleepMillis(1000000);

    // shutdown
    cron.stop();
    client.close();
    serverDest.stop();
    serverProxy.stop();
    connManager.shutdown({
        sharedKey: config.connManagerKey
    });
});
