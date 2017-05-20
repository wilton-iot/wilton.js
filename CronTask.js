/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./utils"], function(utils) {
    "use strict";

    // todo: logging
    var CronTask = function(config) {
        var opts = utils.defaultObject(config);
        utils.checkProperties(opts, ["expression", "callbackScript"]);
        try {
            var handleJson = wiltoncall("cron_start", JSON.stringify({
                expression: opts.expression,
                callbackScript: opts.callbackScript
            }));
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
                wiltoncall("cron_stop", JSON.stringify({
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
