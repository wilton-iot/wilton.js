/*
 * Copyright 2018, alex at staticlibs.net
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
    "wilton/Socket",
    "wilton/thread"
], function(assert, Channel, Socket, thread) {
    "use strict";

    print("test: wilton/Socket");

    var data = "foobarbaz";

    //  TCP protocol

    thread.run({
        callbackScript: {
            module: "wilton/test/helpers/socketHelper",
            func: "handleTCP",
            args: [data.length]
        }
    });

    var tcpServer = new Socket({
        ipAddress: "127.0.0.1",
        tcpPort: 8088,
        protocol: "TCP",
        role: "server",
        timeoutMillis: 60000
    });

    // todo: test write large
    tcpServer.write({
        data: data,
        timeoutMillis: 10000
    });

    var received = tcpServer.read({
        bytesToRead: data.length - 1,
        timeoutMillis: 10000
    });
    assert.equal(received.length, data.length - 1);

    var tail = tcpServer.read({
        timeoutMillis: 10000
    });
    assert.equal(tail.length, 1);

    /*
    var empty = socket.read({
        timeoutMillis: 100
    });
    assert.equal(empty.length, 0);
    */

    assert.equal(data, received + tail);

    tcpServer.close();

    // UDP protocol

    var udpStarted = new Channel("SocketTest.udpStarted");
    thread.run({
        callbackScript: {
            module: "wilton/test/helpers/socketHelper",
            func: "handleUDP",
            args: [data.length, "SocketTest.udpStarted"]
        }
    });

    udpStarted.receive();

    var udpServer = new Socket({
        ipAddress: "127.0.0.1",
        udpPort: 8088,
        protocol: "UDP",
        role: "server",
        timeoutMillis: 60000
    });

    var udpClient = new Socket({
        ipAddress: "127.0.0.1",
        udpPort: 8089,
        protocol: "UDP",
        role: "client",
        timeoutMillis: 60000
    });
    
    // todo: test write large
    udpClient.write({
        data: data,
        timeoutMillis: 10000
    });

    var received = udpServer.read({
        timeoutMillis: 10000
    });
    assert.equal(received, data);

    udpClient.close();
    udpServer.close();
    udpStarted.close();

});
