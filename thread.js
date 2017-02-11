/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./nativeLib", "./utils"], function(nativeLib, utils) {
    "use strict";

    function run(options) {
        var opts = utils.defaultObject(options);
        utils.checkProperties(opts, ["callbackScript"]);
        try {
            nativeLib.wiltoncall("thread_run", JSON.stringify({
                callbackScript: opts.callbackScript
            }));
        } catch (e) {
            utils.callOrThrow(opts.onFailure, e);
        }
    }

    function sleepMillis(millis, options) {
        var opts = utils.defaultObject(options);
        try {
            nativeLib.wiltoncall("thread_sleep_millis", JSON.stringify({
                millis: millis
            }));
            utils.callOrIgnore(opts.onSuccess);
        } catch (e) {
            utils.callOrThrow(opts.onFailure, e);
        }
    }

    return {
        run: run,
        sleepMillis: sleepMillis
    };
});
