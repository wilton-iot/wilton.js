/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["wilton/thread", "wilton/shared", "./_testUtils"], function(thread, shared, testUtils) {
    "use strict";
    var assert = testUtils.assert;

    

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

    shared.waitChange({
        timeoutMillis: 15000,
        key: "threadTest",
        currentValue: {
            val: 0
        }
    });
    
    var loaded = shared.get("threadTest");
    assert(1 === loaded.val);

    shared.remove("threadTest");
    
    thread.sleepMillis(500);
});
