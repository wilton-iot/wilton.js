
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
