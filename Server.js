/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./Request", "./utils", "./Logger"], function(Request, utils, Logger) {
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
                // expects that it is sync
                require([vi], function(mod) {
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
                });
            } else {
                utils.checkProperties(vi, ["method", "path", "callbackScript"]);
                res.push(vi);
            }
        }
        return res;
    }

    var Server = function(config) {
        var opts = utils.defaultObject(config);
        var onSuccess = opts.onSuccess;
        var onFailure = opts.onFailure;
        delete opts.onSuccess;
        delete opts.onFailure;
        try {
            // in future use opts.gatewayModule for non-JVM engines
            opts.views = prepareViews(opts.views);
            var handleJson = wiltoncall("server_create", JSON.stringify(opts));
            var handleObj = JSON.parse(handleJson);
            this.handle = handleObj.serverHandle;
            utils.callOrIgnore(onSuccess);
        } catch (e) {
            utils.callOrThrow(onFailure, e);
        }
    };

    Server.prototype = {
        stop: function(options) {
            var opts = utils.defaultObject(options);
            try {
                wiltoncall("server_stop", JSON.stringify({
                    serverHandle: this.handle
                }));
                utils.callOrIgnore(opts.onSuccess);
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        }
    };
    
    Server.dispatch = function (callbackScriptJson, requestHandle) {
        var cs = callbackScriptJson;
        if ("string" !== typeof (cs.module) || "string" !== typeof (cs.func) ||
                "undefined" === typeof (cs.args) || !(cs.args instanceof Array)) {
            throw new Error("Invalid 'callbackScriptJson' specified: [" + JSON.stringofy(cs) + "]");
        }
        var module;
        // expected to be always sync
        require([cs.module], function(mod) {
            module = mod;
        });
        var req = new Request(requestHandle);
        // target call
        module[cs.func].call(module, req);
        return null;
    };
    
    return Server;

});
