
define([
    "assert",
    "wilton/Channel",
    "wilton/thread"
], function(assert, Channel, thread) {
    "use strict";

    print("test: wilton/ChannelTest buffered");

    var msg = {
        foo: 42
    };

    // trace
    var traceChan = new Channel({
        name: "ChannelTest.trace",
        size: 64
    });


    // buffered

    var chan = new Channel({
        name: "ChannelTest.buffered.in",
        size: 2
    });
    var retChan = new Channel({
        name: "ChannelTest.buffered.out",
        size: 2
    });

    thread.run({
        callbackScript: {
            module: "wilton/test/helpers/ChannelHelper",
            func: "conduit",
            args: ["ChannelTest.buffered.in", "ChannelTest.buffered.out", "ChannelTest.trace"]
        }
    });

    assert(traceChan.offer({
        msg: "test:send:pre"
    }));
    assert(chan.send(msg));
    assert(traceChan.offer({
        msg: "test:send:post"
    }));
    assert(traceChan.offer({
        msg: "test:send:pre"
    }));
    assert(chan.offer(msg));
    assert(traceChan.offer({
        msg: "test:send:post"
    }));
    assert(!chan.offer(msg));

    assert(null === retChan.peek());
    assert(null === retChan.poll());
    assert(traceChan.offer({
        msg: "test:empty"
    }));
    assert(traceChan.offer({
        msg: "test:receive:pre"
    }));
    assert.deepEqual(retChan.receive(), msg);
    assert(traceChan.offer({
        msg: "test:receive:post"
    }));
    thread.sleepMillis(100);
    assert(traceChan.offer({
        msg: "test:receive:pre"
    }));
    assert.deepEqual(retChan.peek(), msg);
    assert.deepEqual(retChan.poll(), msg);
    assert(traceChan.offer({
        msg: "test:receive:post"
    }));
    assert(null === retChan.peek());
    assert(null === retChan.poll());
    assert(traceChan.offer({
        msg: "test:empty"
    }));

    assert(chan.send(false));
    assert(traceChan.offer({
        msg: "test:sent_shutdown"
    }));

    thread.sleepMillis(100);
    chan.close();
    retChan.close();

    var traceBuffered = [];
    for(;;) {
        var envelope = traceChan.poll();
        if (null === envelope) break;
        traceBuffered.push(envelope.msg);
    }
    // print(JSON.stringify(traceBuffered));


    // sync

    print("test: wilton/ChannelTest sync");

    var chan = new Channel({
        name: "ChannelTest.sync.in",
        size: 0
    });
    var retChan = new Channel({
        name: "ChannelTest.sync.out",
        size: 0
    });

    thread.run({
        callbackScript: {
            module: "wilton/test/helpers/ChannelHelper",
            func: "conduit",
            args: ["ChannelTest.sync.in", "ChannelTest.sync.out", "ChannelTest.trace"]
        }
    });

    assert(!chan.offer(msg));
    assert(traceChan.offer({
        msg: "test:send:pre"
    }));
    assert(chan.send(msg));
    assert(traceChan.offer({
        msg: "test:send:post"
    }));
    assert.equal(retChan.poll(), null);
    assert(traceChan.offer({
        msg: "test:receive:pre"
    }));
    assert.deepEqual(retChan.receive(), msg);
    assert(traceChan.offer({
        msg: "test:receive:post"
    }));
    assert(chan.send(false));
    assert(traceChan.offer({
        msg: "test:sent_shutdown"
    }));
    var traceSync = [];
    for(;;) {
        var envelope = traceChan.poll();
        if (null === envelope) break;
        traceSync.push(envelope.msg);
    }

    chan.close();
    retChan.close();
    // print(JSON.stringify(traceSync));
    // all channels must be empty
    // print(Channel.dumpRegistry());


    // select

    print("test: wilton/ChannelTest select");

    var chan = new Channel({
        name: "ChannelTest.selector.in",
        size: 0
    });
    var retChan = new Channel({
        name: "ChannelTest.selector.out",
        size: 2
    });
    var dummyChan1 = new Channel({
        name: "ChannelTest.selector.dummy1",
        size: 1
    });
    var dummyChan2 = new Channel({
        name: "ChannelTest.selector.dummy2",
        size: 0
    });

    thread.run({
        callbackScript: {
            module: "wilton/test/helpers/ChannelHelper",
            func: "conduit",
            args: ["ChannelTest.selector.in", "ChannelTest.selector.out", "ChannelTest.trace", 100]
        }
    });

    // not selected
    var idx = Channel.select({
        channels: [dummyChan1, retChan, dummyChan2],
        timeoutMillis: 100
    });
    assert.equal(-1, idx);

    assert(chan.send(msg));

    // selected
    var idx2 = Channel.select({
        channels: [dummyChan1, retChan, dummyChan2],
        timeoutMillis: 200
    });
    assert.equal(1, idx2);
    assert.deepEqual(retChan.peek(), msg);
    assert.deepEqual(retChan.poll(), msg);

    // shutdown conduit
    assert(chan.send(false));

    // no more selected
    var idx3 = Channel.select({
        channels: [dummyChan1, retChan, dummyChan2],
        timeoutMillis: 100
    });
    assert.equal(-1, idx3);
    assert.equal(retChan.peek(), null);
    assert.equal(retChan.poll(), null);
    
    chan.close();
    retChan.close();
    dummyChan1.close();
    dummyChan2.close();
    traceChan.close();
    
});
