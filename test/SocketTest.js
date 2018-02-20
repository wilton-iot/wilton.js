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
    "wilton/Socket",
    "wilton/thread"
], function(assert, Socket, thread) {
    "use strict";

    print("test: wilton/Socket");

    var data = "foobarbaz";

    thread.run({
        callbackScript: {
            module: "wilton/test/helpers/socketHelper",
            func: "handleClient",
            args: [data.length]
        }
    });

    var socket = new Socket({
        ipAddress: "127.0.0.1",
        tcpPort: 8088,
        protocol: "TCP",
        role: "server",
        timeoutMillis: 60000
    });

    // todo: test write large
    socket.write({
        data: data,
        timeoutMillis: 10000
    });

    var received = socket.read({
        bytesToRead: data.length - 1,
        timeoutMillis: 10000
    });
    assert.equal(received.length, data.length - 1);

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

    assert.equal(data, received + tail);

    socket.close();

});
