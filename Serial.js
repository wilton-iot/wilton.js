
define([
    "./dyload",
    "./hex",
    "./wiltoncall",
    "./utils"
], function(dyload, hex, wiltoncall, utils) {
    "use strict";

    dyload({
        name: "wilton_serial"
    });

    var Serial = function(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            if (utils.hasPropertyWithType(opts, "handle", "number")) {
                this.handle = opts.handle;
            } else {
                var handleJson = wiltoncall("serial_open", opts);
                var handleObj = JSON.parse(handleJson);
                utils.checkPropertyType(handleObj, "serialHandle", "number");
                this.handle = handleObj.serialHandle;
            }
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    Serial.prototype = {

        read: function(length, callback) {
            try {
                var res = wiltoncall("serial_read", {
                    serialHandle: this.handle,
                    length: length
                });
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        readLine: function(callback) {
            try {
                var res = wiltoncall("serial_readline", {
                    serialHandle: this.handle
                });
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        writePlain: function(data, callback) {
            try {
                var resStr = wiltoncall("serial_write", {
                    serialHandle: this.handle,
                    dataHex: hex.encodeBytes(data)
                });
                var resObj = JSON.parse(resStr);
                utils.checkPropertyType(resObj, "bytesWritten", "number");
                var res = resObj.bytesWritten;
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        writeHex: function(dataHex, callback) {
            try {
                var resStr = wiltoncall("serial_write", {
                    serialHandle: this.handle,
                    dataHex: hex.uglify(dataHex)
                });
                var resObj = JSON.parse(resStr);
                utils.checkPropertyType(resObj, "bytesWritten", "number");
                var res = resObj.bytesWritten;
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        close: function(callback) {
            try {
                wiltoncall("serial_close", {
                    serialHandle: this.handle
                });
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }
    };

    return Serial;
});
