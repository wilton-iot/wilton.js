
define([
    "../dyload",
    "../hex",
    "../wiltoncall",
    "../utils"
], function(dyload, hex, wiltoncall, utils) {
    "use strict";

    var USB = function(options, callback) {
        dyload({
            name: "wilton_usb"
        });
        var opts = utils.defaultObject(options);
        try {
            var handleJson = wiltoncall("usb_open", opts);
            var handleParsed = JSON.parse(handleJson);
            this.handle = handleParsed.usbHandle;
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    USB.prototype = {
        read: function(length, callback) {
            try {
                var res = wiltoncall("usb_read", {
                    usbHandle: this.handle,
                    length: length
                });
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },
        
        writePlain: function(data, callback) {
            try {
                var resstr = wiltoncall("usb_write", {
                    usbHandle: this.handle,
                    dataHex: hex.encodeBytes(data)
                });
                var resjson = JSON.parse(resstr);
                var res = resjson.bytesWritten;
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        writeHex: function(dataHex, callback) {
            try {
                var resstr = wiltoncall("usb_write", {
                    usbHandle: this.handle,
                    dataHex: hex.uglify(dataHex)
                });
                var resjson = JSON.parse(resstr);
                var res = resjson.bytesWritten;
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        control: function(options, callback) {
            var opts = utils.defaultObject(options);
            try {
                var res = wiltoncall("usb_control", {
                    usbHandle: this.handle,
                    options: opts
                });
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        close: function(callback) {
            try {
                wiltoncall("usb_close", {
                    usbHandle: this.handle
                });
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }
    };

    return USB;
});
