/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "assert",
    "wilton/Channel",
    "wilton/CronTask"
], function(assert, Channel, CronTask) {
    "use strict";

    print("test: wilton/CronTask");
    
    var chanOut = new Channel("cronTestOut");
    var chanIn = new Channel("cronTestIn");

    var cron = new CronTask({
        expression: "* * * * * *",
        callbackScript: {
            module: "wilton/test/helpers/cronHelper",
            func: "increment1"
        }
    });

    var start = Date.now();
    chanOut.send(42);
    assert.equal(chanIn.receive(), 43);
    assert(Date.now() - start > 1000);

    chanOut.send(44);
    assert.equal(chanIn.receive(), 45);
    assert(Date.now() - start > 2000);

    // check handle construction
    var cron2 = new CronTask({
        handle: cron.handle
    });
    assert.equal(cron2.handle, cron.handle);

    cron2.stop();

    chanOut.close();
    chanIn.close();
});
