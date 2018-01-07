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
    "wilton/Channel",
    "wilton/thread"
], function(assert, Channel, thread) {
    "use strict";
    
    return {
        conduit: function(nameIn, nameOut, nameLog, delayMillis) {
            var src = Channel.lookup(nameIn);
            var sink = Channel.lookup(nameOut);
            var trace = Channel.lookup(nameLog);
            thread.sleepMillis(100);
            for(;;) {
                //print(Channel.dumpRegistry());
                assert(trace.offer({
                    msg: "conduit:receive:pre"
                }));
                var message = src.receive();
                if (null === message || false === message) break;
                assert.deepEqual(message, {
                    foo: 42
                });
                assert(trace.offer({
                    msg: "conduit:receive:post"
                }));
                if ("number" === typeof (delayMillis)) {
                    thread.sleepMillis(delayMillis);
                }
                assert(trace.offer({
                    msg: "conduit:send:pre"
                }));
                var sent = sink.send(message);
                assert(trace.offer({
                    msg: "conduit:send:post"
                }));
                assert.equal(true, sent);
            }
            assert(trace.offer({
                msg: "conduit:shutdown"
            }));
        }
    };
});
