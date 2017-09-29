/*
 * Copyright 2017, alex at staticlibs.net
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @namespace Serial
 * 
 * __wilton/Serial__ \n
 * Connect to hardware devices using Serial protocol.
 * 
 * TODO
 */
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
