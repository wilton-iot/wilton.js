/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["wilton/thread", "wilton/shared", "./_testUtils"], function(thread, shared, testUtils) {
    "use strict";

    shared.put({
        key: "threadTest",
        value: {
            val: 0
        }
    });

    thread.run({
        callbackScript: {
            "module": "wilton/test/_testUtils",
            "func": "threadTestMethod",
            "args": []
        }
    });
    // todo: use wait for change here
    thread.sleepMillis(500);
    
    var loaded = shared.get({
        key: "threadTest"
    });
    testUtils.assert(1 === loaded.val);

    shared.remove({
        key: "threadTest"
    });
});
