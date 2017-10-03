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
 * This module allows to intract with hardware devices using `RS232` protocol.
 * 
 * Responses from device are returned encoded in hexadecimal encoding, use `wilton/hex` for decoding.
 * 
 * Underlying Serial connection can be closed manually with `close()`
 * or it will be closed during the shutdown.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // open connection
 * var ser = new Serial({
 *     port: "/dev/ttyUSB1",
 *     baudRate: 4800,
 *     parity: "NONE", // "EVEN", "ODD", "MARK", "SPACE"
 *     byteSize: 8,
 *     stopBitsCount: 1,
 *     timeoutMillis: 500
 * });
 *
 * // write request
 * var bytes_written1 = ser.writePlain("foo\r\n");
 * var bytes_written2 = ser.writeHex("66 6f 6f 0d 0a");
 *
 * // read response
 * var respHex = ser.readLine();
 *
 * // close connection
 * ser.close();
 * 
 * @endcode
 * 
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

    /**
     * @function constructor
     * 
     * Creates Serial instance.
     * 
     * Creates Serial object instace and opens the underlying `RS232` connection.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Object` Serial instance
     * 
     * __Options__
     *  - __port__ `String` serial port address (OS-dependent), examples: `/dev/ttyUSB1`, `COM4`
     *  - __baudRate__ `Number` connection baud rate
     *  - __parity__ `String` enables parity checking, supported values: `NONE`, `EVEN`, `ODD`, `MARK`, `SPACE`
     *  - __byteSize__ `Number` number of data bits
     *  - __stopBitsCount__ `Number` number of stop bits
     *  - __timeoutMillis__ `Number` timeout for read and write operations (in milliseconds)
     */
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
        /**
         * @function read
         * 
         * Reads data from device.
         * 
         * Tries to read a specified amount of data from the device.
         * Returned result can conntains less data than requested.
         * Returns empty result if no data is available and timeout is exceeded.
         * 
         * Uses `timeoutMillis` parameter (specified in constructor) as a timeout.
         * 
         * @param length `Number` amount of the data to read (in bytes)
         * @param callback `Function|Undefined` callback to receive result or error
         * @returns `String` device response data in hexadecimal encoding, empty string on timeout
         */
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

        /**
         * @function readLine
         * 
         * Reads single line of data from device.
         * 
         * Tries to read a data from the device until line ending (`\n` or `\r\n`) will be
         * read or timeout happens. Line ending is not included into result.
         * 
         * Returned result can conntains less data than requested.
         * Returns empty result if no data is available and timeout is exceeded.
         * 
         * Uses `timeoutMillis` parameter (specified in constructor) as a timeout.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @returns `String` device response data in hexadecimal encoding, empty string on timeout
         */
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

        /**
         * @function writePlain
         * 
         * Writes specifed string to device.
         * 
         * Writes specified string to device converting the bytes
         * of input string into hexadecimal encoding as-is without changing the UTF-16 encoding.
         * Using this method with non-ASCII symbols may lead to unexpected results.
         * 
         * To write UTF-8 bytes to device use `writeHex()` in conjunction with
         * `hex.encodeUTF8()`.
         * 
         * Uses `timeoutMillis` parameter (specified in constructor) as a timeout.
         * 
         * @param data `String` string to write to device
         * @param callback `Function|Undefined` callback to receive result or error
         * @returns `Number` number of bytes written to device
         */
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

        /**
         * @function writeHex
         * 
         * Writes specifed string in hexadecimal encoding to device.
         * 
         * Writes specified hex-string to device, unlike `writePlain()` this
         * function may be used to write abritrary (possibly binary) data.
         * 
         * Uses `timeoutMillis` parameter (specified in constructor) as a timeout.
         * 
         * @param dataHex `String` string encoded as hexadecimal to write to device
         * @param callback `Function|Undefined` callback to receive result or error
         * @returns `Number` number of bytes written to device
         */
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

        /**
         * @function close
         * 
         * Closes connection to device
         * 
         * Closes Serial connection releases system resources.
         * Devices not closed manually, will be closed automatically during the shutdown.
         *
         * @param callback `Function|Undefined` callback to receive result or error
         * @returns `Undefined`
         */
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
