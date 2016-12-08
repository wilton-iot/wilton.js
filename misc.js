/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./nativeLib", "./utils"], function(nativeLib, utils) {
    "use strict";

    function threadSleepMillis(millis, options) {
        var opts = utils.defaultObject(options);
        try {
            nativeLib.wiltoncall("thread_sleep_millis", JSON.stringify({
                millis: millis
            }));
            utils.callOrIgnore(opts.onSuccess);
        } catch (e) {
            utils.callOrThrow(opts.onFailure, e);
        }
    };

    function tcpWaitForConnection(options) {
        var opts = utils.defaultObject(options);
        var onSuccess = opts.onSuccess;
        var onFailure = opts.onFailure;
        delete opts.onSuccess;
        delete opts.onFailure;
        try {
            nativeLib.wiltoncall("tcp_wait_for_connection", JSON.stringify(opts));
            utils.callOrIgnore(onSuccess);
        } catch (e) {
            utils.callOrThrow(onFailure, e);
        }
    };

    return {
        threadSleepMillis: threadSleepMillis,
        tcpWaitForConnection: tcpWaitForConnection
    };
});
