/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./utils"], function(wiltoncall, utils) {
    "use strict";

    function run(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            utils.checkProperties(opts, ["callbackScript"]);
            wiltoncall("thread_run", {
                callbackScript: opts.callbackScript
            });
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    function sleepMillis(millis, callback) {
        try {
            wiltoncall("thread_sleep_millis", {
                millis: millis
            });
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return {
        run: run,
        sleepMillis: sleepMillis
    };
});
