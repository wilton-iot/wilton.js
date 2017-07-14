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
    
    function getModulePath(moduleName, callback) {
        var modname = utils.defaultString(moduleName);
        try {
            var cfobj = wiltoncall("get_wiltoncall_config");
            var cf = JSON.parse(cfobj);
            var res = null;
            if ("object" === typeof (cf.requireJsConfig.paths)) {
                for (var mod in cf.requireJsConfig.paths) {
                    if (cf.requireJsConfig.paths.hasOwnProperty(mod)) {
                        var modshort = mod;
                        if (utils.endsWith(mod, "/")) {
                            var modshort = mod.substring(0, mod.length - 2);
                        }
                        if (utils.startsWith(modname, modshort)) {
                            var modpath = cf.requireJsConfig.paths[mod];
                            if (utils.startsWith(modpath, "file://")) {
                                modpath = modpath.substr(7);
                            }
                            if (modname.length > mod.length) {
                                var tail = modname.substr(mod.lenght);
                                modpath = modpath + tail;
                            }
                            res = modpath;
                            break;
                        }
                    }
                }
            } 
            if (null === res) {
                res = cf.requireJsConfig.baseUrl + "/" + modname;
            }
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return {
        tcpWaitForConnection: tcpWaitForConnection,
        spawnProcess: spawnProcess,
        getModulePath: getModulePath
    };
});
