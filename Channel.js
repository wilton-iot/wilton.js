
define([
    "./dyload",
    "./wiltoncall",
    "./utils"
], function(dyload, wiltoncall, utils) {
    "use strict";

    dyload({
        name: "wilton_channel"
    });

    function Channel(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            if (utils.hasPropertyWithType(opts, "handle", "number")) {
                this.handle = opts.handle;
            } else {
                var handleJson = wiltoncall("channel_create", opts);
                var handleObj = JSON.parse(handleJson);
                utils.checkPropertyType(handleObj, "channelHandle", "number");
                this.handle = handleObj.channelHandle;
            }
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    Channel.lookup = function(name, callback) {
        try {
            var handleJson = wiltoncall("channel_lookup", {
                name: name
            });
            var handleObj = JSON.parse(handleJson);
            utils.checkPropertyType(handleObj, "channelHandle", "number");
            var res = new Channel({
                handle: handleObj.channelHandle
            });
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    Channel.select = function(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var handles = [];
            for (var i = 0; i < opts.channels.length; i++) {
                handles.push(opts.channels[i].handle);
            }
            var resStr = wiltoncall("channel_select", {
                channels: handles,
                timeoutMillis: opts.timeoutMillis
            });
            var resObj = JSON.parse(resStr);
            utils.checkPropertyType(resObj, "selectedChannelIndex", "number");
            var res = resObj.selectedChannelIndex;
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    Channel.dumpRegistry = function(callback) {
        try {
            var res = wiltoncall("channel_dump_registry");
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    Channel.prototype = {

        send: function(msg, callback) {
            try {
                var message = utils.defaultJson(msg);
                var resStr = wiltoncall("channel_send", {
                    channelHandle: this.handle,
                    message: message 
                });
                var resObj = JSON.parse(resStr);
                utils.checkPropertyType(resObj, "success", "boolean");
                var res = resObj.success;
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        receive: function(callback) {
            try {
                var resStr = wiltoncall("channel_receive", {
                    channelHandle: this.handle
                });
                var res = null !== resStr ? JSON.parse(resStr) : null;
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        offer: function(msg, callback) {
            try {
                var message = utils.defaultJson(msg);
                var resStr = wiltoncall("channel_offer", {
                    channelHandle: this.handle,
                    message: message 
                });
                var resObj = JSON.parse(resStr);
                utils.checkPropertyType(resObj, "success", "boolean");
                var res = resObj.success;
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        poll: function(callback) {
            try {
                var resStr = wiltoncall("channel_poll", {
                    channelHandle: this.handle
                });
                var res = null !== resStr ? JSON.parse(resStr) : null;
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }, 

        close: function(callback) {
            try {
                wiltoncall("channel_close", {
                    channelHandle: this.handle
                });
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }
    };

    return Channel;
});
