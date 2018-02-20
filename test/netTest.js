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
    "wilton/net",
    "wilton/Server"
], function(assert, net, Server) {
    "use strict";

    print("test: wilton/net");

    // resolveHostname

    var ipList = net.resolveHostname({
        hostname: "localhost",
        timeoutMillis: 500
    });
    assert(ipList.length > 0);


    // waitForTcpConnection

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

    var thrown = false;
    net.waitForTcpConnection({
        ipAddress: "8.8.8.8",
        tcpPort: 8081,
        timeoutMillis: 100
    }, function(e) {
        if ("undefined" !== typeof(e)) {
            thrown = true;
        }
    });
    assert(thrown);

    server.stop();

});
