/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./nativeLib", "./utils"], function(nativeLib, utils) {
    "use strict";

    var CronTask = function(config) {
        var opts = utils.defaultObject(config);
        utils.checkPropertyType(opts, "callback", "function");
        var onSuccess = opts.onSuccess;
        var onFailure = opts.onFailure;
        delete opts.onSuccess;
        delete opts.onFailure;
        try {
            var cb = opts.callback;
            delete opts.callback;
            var runnable = nativeLib.wrapRunnable(cb);
            var data = JSON.stringify(opts);
            var handleJson = nativeLib.wiltoncall("cron_start", data, runnable);
            var handleObj = JSON.parse(handleJson);
            this.handle = handleObj.cronHandle;
            utils.callOrIgnore(onSuccess);
        } catch (e) {
            utils.callOrThrow(onFailure, e);
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
