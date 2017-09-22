/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "./dyload",
    "./wiltoncall",
    "./utils"
], function(dyload, wiltoncall, utils) {
    "use strict";

    dyload({
        name: "wilton_cron"
    });

    function CronTask(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            if (utils.hasPropertyWithType(opts, "handle", "number")) {
                this.handle = opts.handle;
            } else {
                utils.checkProperties(opts, ["expression", "callbackScript"]);
                var handleJson = wiltoncall("cron_start", {
                    expression: opts.expression,
                    callbackScript: opts.callbackScript
                });
                var handleObj = JSON.parse(handleJson);
                utils.checkPropertyType(handleObj, "cronHandle", "number");
                this.handle = handleObj.cronHandle;
            }
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    CronTask.prototype = {
        stop: function(callback) {
            try {
                wiltoncall("cron_stop", {
                    cronHandle: this.handle
                });
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }
    };

    return CronTask;

});
