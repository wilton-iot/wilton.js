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
    "wilton/hex",
    "wilton/Socket",
    "wilton/thread"
], function(assert, Channel, hex, Socket, thread) {
    "use strict";

    print("test: wilton/Socket");

    var dataPlain = "foo";
    var dataHex = hex.encodeUTF8("barbaz");
    var dataLen = dataPlain.length + (dataHex.length/2);

    //  TCP protocol

    var tcpThreadChan = thread.run({
        callbackScript: {
            module: "wilton/test/helpers/socketHelper",
            func: "handleTCP",
            args: [dataLen]
        }
    });

    var tcpServer = new Socket({
        ipAddress: "127.0.0.1",
        tcpPort: 8088,
        protocol: "TCP",
        role: "server",
        // valgrind is slow
        timeoutMillis: 60000
    });

    var twp = tcpServer.writePlain(dataPlain);
    assert.equal(twp, 3);
    var twh = tcpServer.writeHex(dataHex);
    assert.equal(twh, 6);

    // todo: test write large

    var receivedHex = tcpServer.read(dataLen - 1);
    var received = hex.decodeUTF8(receivedHex);
    assert.equal(received.length, dataLen - 1);
    assert.equal(received, "foobarba");

    var tailHex = tcpServer.read(1);
    var tail = hex.decodeUTF8(tailHex);
    assert.equal(tail.length, 1);
    assert.equal(tail, "z");

    // todo: test empty read

    /*
    var empty = socket.read({
        timeoutMillis: 100
    });
    assert.equal(empty.length, 0);
    */

    tcpServer.close();
    tcpThreadChan.receiveAndClose();

    // UDP protocol

    var udpStarted = new Channel("SocketTest.udpStarted");
    var udpThreadChan = thread.run({
        callbackScript: {
            module: "wilton/test/helpers/socketHelper",
            func: "handleUDP",
            args: [dataPlain.length, "SocketTest.udpStarted"]
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

    udpClient.writePlain(dataPlain);

    var receivedHex = udpServer.read(dataPlain.length);
    var received = hex.decodeUTF8(receivedHex);
    assert.equal(received, dataPlain);

    udpClient.close();
    udpServer.close();
    udpStarted.close();
    udpThreadChan.receiveAndClose();

});
