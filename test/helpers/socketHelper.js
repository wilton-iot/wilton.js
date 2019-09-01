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
    "wilton/Socket"
], function(assert, Channel, hex, Socket) {

    return {
        handleTCP: function(bytesToRead) {
            var socket = new Socket({
                ipAddress: "127.0.0.1",
                tcpPort: 8088,
                protocol: "TCP",
                role: "client",
                timeoutMillis: 60000
            });
            var receivedHex = socket.read(bytesToRead - 1);
            var received = hex.decodeUTF8(receivedHex);
            assert.equal(received.length, bytesToRead - 1);

            var tailHex = socket.read(1);
            var tail = hex.decodeUTF8(tailHex);
            assert.equal(tail.length, 1);

            /*
            var empty = socket.read({
                timeoutMillis: 100
            });
            assert.equal(empty.length, 0);
            */

            var written = socket.writePlain(received);
            assert.equal(written, bytesToRead - 1);

            var tw = socket.writeHex(tailHex);
            assert.equal(tw, 1);

            socket.close();
        },

        handleUDP: function(bytesToRead, startupChannel) {
            var server = new Socket({
                ipAddress: "127.0.0.1",
                udpPort: 8089,
                protocol: "UDP",
                role: "server",
                timeoutMillis: 60000
            });

            Channel.lookup(startupChannel).send(true);

            var client = new Socket({
                ipAddress: "127.0.0.1",
                udpPort: 8088,
                protocol: "UDP",
                role: "client",
                timeoutMillis: 60000
            });
            var urh = server.read(bytesToRead);
            var ur = hex.decodeUTF8(urh);
            assert.equal(ur.length, bytesToRead);

            client.writeHex(urh);

            server.close();
            client.close();
        }
    };
});
