

define([
    "wilton/net",
    "wilton/Server"
], function(net, Server) {
    "use strict";

    print("test: wilton/net");

    var server = new Server({
        tcpPort: 8080,
        views: [
            "wilton/test/views/hi"
        ]
    });

    net.waitForTcpConnection({
        ipAddress: "127.0.0.1",
        tcpPort: 8080,
        timeoutMillis: 100
    });

    server.stop();
    
});
