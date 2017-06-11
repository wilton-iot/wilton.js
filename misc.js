/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./utils"], function(wiltoncall, utils) {
    "use strict";

    function tcpWaitForConnection(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            wiltoncall("tcp_wait_for_connection", opts);
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return {
        tcpWaitForConnection: tcpWaitForConnection
    };
});
