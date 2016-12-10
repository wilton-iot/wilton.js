/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./nativeLib", "./utils"], function(nativeLib, utils) {
    "use strict";

    var CronTask = function(config) {
        var opts = utils.defaultObject(config);
        utils.checkProperties(opts, ["callbackModule", "callbackMethod", "expression"]);
        try {
            var runnable = nativeLib.wrapRunnable(function() {
                // this needs to be moved into native part for
                // non-threaded JS runtimes (v8/duktape)
                require([opts.callbackModule], function(mod) {
                    mod[opts.callbackMethod]();
                });
            });
            var data = JSON.stringify({
                expression: opts.expression
            });
            var handleJson = nativeLib.wiltoncall("cron_start", data, runnable);
            var handleObj = JSON.parse(handleJson);
            this.handle = handleObj.cronHandle;
            utils.callOrIgnore(opts.onSuccess);
        } catch (e) {
            utils.callOrThrow(opts.onFailure, e);
        }
    };

    CronTask.prototype = {
        stop: function(options) {
            var opts = utils.defaultObject(options);
            try {
                nativeLib.wiltoncall("cron_stop", JSON.stringify({
                    cronHandle: this.handle
                }));
                utils.callOrIgnore(opts.onSuccess);
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        }
    };

    return CronTask;

});
