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
    
    function spawnProcess(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var res = wiltoncall("process_spawn", opts);
            utils.callOrIgnore(callback,res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function wiltonConfig(callback) {
        try {
            var resstr = wiltoncall("get_wiltoncall_config");
            var res = JSON.parse(resstr);
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function stdinReadline(callback) {
        try {
            var res = wiltoncall("stdin_readline");
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    function waitForSignal(callback) {
        try {
            wiltoncall("signal_await");
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    return {
        tcpWaitForConnection: tcpWaitForConnection,
        spawnProcess: spawnProcess,
        wiltonConfig: wiltonConfig,
        stdinReadline: stdinReadline,
        waitForSignal: waitForSignal
    };
});
