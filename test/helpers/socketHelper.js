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
    "wilton/Socket"
], function(assert, Socket) {

    return {
        handleClient: function(bytesToRead) {
            var socket = new Socket({
                ipAddress: "127.0.0.1",
                tcpPort: 8088,
                protocol: "TCP",
                role: "client",
                timeoutMillis: 60000
            });
            var received = socket.read({
                bytesToRead: bytesToRead - 1,
                timeoutMillis: 10000
            });
            assert.equal(received.length, bytesToRead - 1);

            var tail = socket.read({
                timeoutMillis: 10000
            });
            assert.equal(tail.length, 1);

            /*
            var empty = socket.read({
                timeoutMillis: 100
            });
            assert.equal(empty.length, 0);
            */

            socket.write({
                data: received,
                timeoutMillis: 10000
            });

            socket.write({
                data: tail,
                timeoutMillis: 10000
            });
            socket.close();
        }
    };
});
