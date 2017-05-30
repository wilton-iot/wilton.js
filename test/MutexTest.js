/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

require(["wilton/Mutex", "wilton/shared", "wilton/thread", "tests/_testUtils"], function(Mutex, shared, thread, testUtils) {
    "use strict";

    var mutex = new Mutex();
    
    shared.put({
        key: "mutexTest",
        value: {
            val: 0
        }
    });
    
    mutex.synchronized({
        callbackScript: {
            "module": "tests/_testUtils",
            "func": "mutexTestMethod1",
            "args": []
        }
    });
    var loaded1 = shared.get({
        key: "mutexTest"
    });
    
    testUtils.assert(1 === loaded1.val);
    
    thread.run({
        callback: function() {
            thread.sleepMillis(100);
            mutex.lock(); // pessimization       
            mholder[0] += 1;
            mutex.notifyAll();
            mutex.unlock();
        }
    });
    
    mutex.lock();
    mutex.wait({
        timeoutMillis: 30000,
        callback: function() {
            return 2 === mholder[0];
        }
    });
    
    mutex.unlock();
    mutex.destroy();
    testUtils.assert(2 === mholder[0]);

    shared.remove({
        key: "mutexTest"
    });
});
