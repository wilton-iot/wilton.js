/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["wilton/shared"], function(shared) {
    "use strict";
    return {
        increment1: function() {
            var stored = shared.get("CronTaskTest");
            if (null !== stored) {
                stored.val += 1;
                shared.put("CronTaskTest", stored);
            }
        }
    };
});

