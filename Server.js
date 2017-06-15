/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./Request", "./utils", "./Logger"], function(wiltoncall, Request, utils, Logger) {
    "use strict";

    var logger = new Logger("wilton.server");
    var METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];

    function prepareViews(views) {
        if(utils.undefinedOrNull(views)) {
            throw new Error("Invalid null 'views'attribute specified");
        }
        if (!(views instanceof Array)) {
            throw new Error("Invalid non-array 'views'attribute specified");
        }
        if (0 === views.length) {
            throw new Error("Invalid empty array 'views'attribute specified");
        }
        var res = [];
        for (var i = 0; i < views.length; i++) {
            var vi = views[i];
            if (utils.undefinedOrNull(vi)) {
                throw new Error("Invalid null 'views' element, index: [" + i + "]");
            } else if ("string" === typeof(vi)) {
                var mod = WILTON_requiresync(vi);
                var methodEntries = [];
                for (var j = 0; j < METHODS.length; j++) {
                    var me = METHODS[j];
                    if ("function" === typeof(mod[me])) {
                        methodEntries.push({
                            method: me,
                            path: "/" + vi,
                            callbackScript: {
                                module: "wilton/Server",
                                func: "dispatch",
                                args: [{
                                    module: vi,
                                    func: me,
                                    args: []
                                }]
                            }
                        });
                    }
                }
                if (0 === methodEntries.length) {
                    throw new Error("Invalid 'views' element: must have one or more" +
                            " function attrs: GET, POST, PUT, DELETE, OPTIONS," +
                            " index: [" + i + "]");
                }
                for (var j = 0; j < methodEntries.length; j++) {
                    res.push(methodEntries[j]);
                }
            } else {
                utils.checkProperties(vi, ["method", "path", "callbackScript"]);
                res.push(vi);
            }
        }
        return res;
    }

    var Server = function(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            // in future use opts.gatewayModule for non-JVM engines
            opts.views = prepareViews(opts.views);
            var handleJson = wiltoncall("server_create", opts);
            var handleObj = JSON.parse(handleJson);
            this.handle = handleObj.serverHandle;
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    Server.prototype = {
        stop: function(callback) {
            try {
                wiltoncall("server_stop", {
                    serverHandle: this.handle
                });
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }
    };
    
    Server.dispatch = function (callbackScriptJson, requestHandle) {
        var cs = callbackScriptJson;
        if ("string" !== typeof (cs.module) || "string" !== typeof (cs.func) ||
                "undefined" === typeof (cs.args) || !(cs.args instanceof Array)) {
            throw new Error("Invalid 'callbackScriptJson' specified: [" + JSON.stringofy(cs) + "]");
        }
        var module = WILTON_requiresync(cs.module);
        var req = new Request(requestHandle);
        // target call
        module[cs.func].call(module, req);
        return null;
    };
    
    return Server;

});
