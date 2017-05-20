/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./utils"], function(utils) {
    "use strict";

    function tcpWaitForConnection(options) {
        var opts = utils.defaultObject(options);
        var onSuccess = opts.onSuccess;
        var onFailure = opts.onFailure;
        delete opts.onSuccess;
        delete opts.onFailure;
        try {
            wiltoncall("tcp_wait_for_connection", JSON.stringify(opts));
            utils.callOrIgnore(onSuccess);
        } catch (e) {
            utils.callOrThrow(onFailure, e);
        }
    }

    return {
        tcpWaitForConnection: tcpWaitForConnection
    };
});
