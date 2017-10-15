/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "assert",
    "wilton/Channel",
    "wilton/thread"
], function(assert, Channel, thread) {
    "use strict";

    print("test: wilton/thread");

    var chanOut = new Channel({
        name: "threadTestOut",
        size: 1
    });
    var chanIn = new Channel({
        name: "threadTestIn",
        size: 0
    });

    chanOut.send(42);

    thread.run({
        callbackScript: {
            "module": "wilton/test/helpers/threadHelper",
            "func": "increment1"
        }
    });

    assert.equal(chanIn.receive(), 43);

    chanOut.close();
    chanIn.close();
    
    // wait for thread to die
    thread.sleepMillis(100);
});
