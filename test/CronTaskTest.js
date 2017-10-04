/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "assert",
    "wilton/CronTask",
    "wilton/thread",
    "wilton/shared"
], function(assert, CronTask, thread, shared) {
    "use strict";

    print("test: wilton/CronTask");
    
    shared.put("CronTaskTest", {
        val: 0
    });
    var cron = new CronTask({
        expression: "* * * * * *",
        callbackScript: {
            module: "wilton/test/helpers/cronHelper",
            func: "increment1"
        }
    });
    // takes long, enable me for cron retest
//    thread.sleepMillis(1500);
//    var sh1 = shared.get("CronTaskTest");
//    assert(1 === sh1.val || 2 === sh1.val);
    // check handle construction
    var cron2 = new CronTask({
        handle: cron.handle
    });
    // optional
    cron2.stop();
//    thread.sleepMillis(1000);
//    var sh2 = shared.get("CronTaskTest");
//    assert(1 === sh2.val || 2 === sh2.val);
    shared.remove("CronTaskTest");
});
