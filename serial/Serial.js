
define(["../wiltoncall", "../utils"], function(wiltoncall, utils) {
    "use strict";

    var Serial = function(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var handleJson = wiltoncall("serial_open", opts);
            var handleParsed = JSON.parse(handleJson);
            this.handle = handleParsed.serialHandle;
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

        write: function(data, callback) {
            try {
                var resstr = wiltoncall("serial_write", {
                    serialHandle: this.handle,
                    data: utils.defaultString(data)
                });
                var resjson = JSON.parse(resstr);
                var res = resjson.bytesWritten;
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
