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
 * @namespace USB
 * 
 * __wilton/USB__ \n
 * Connect to hardware devices using USB protocol.
 * 
 * This module allows to interact with USB devices.
 * 
 * It supports `bulk` and `control` transfer modes.
 * 
 * Responses from device are returned encoded in hexadecimal encoding, use `wilton/hex` for decoding.
 * 
 * All `write` and `read` operations
 * are synchronous (blocking) within a specified timeout.
 * Empty response will be returned on timeout.
 * 
 * Underlying USB connection can be closed manually using `close()` method
 * or it will be closed during the shutdown.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // open connection
 * var usb = new USB({ ... });
 * 
 * // change device mode
 * var cresp = usb.control({ ... });
 * // log response
 * logger.debug(hex.prettify(cresp) + " [" + hex.decodeBytes(cresp) + "]");
 * 
 * // write command and read 8 bytes response
 * usb.writeHex("05 56 45 52 30 30 00 00")
 * var resp = usb.read(8)
 * // log response
 * logger.debug(hex.prettify(resp) + " [" + hex.decodeBytes(resp) + "]");
 * 
 * // close connection
 * usb.close()
 * 
 * @endcode
 */
define([
    "./dyload",
    "./hex",
    "./wiltoncall",
    "./utils"
], function(dyload, hex, wiltoncall, utils) {
    "use strict";

    dyload({
        name: "wilton_usb"
    });

    /**
     * @function USB
     * 
     * Create USB instance.
     * 
     * Creates USB object instace and opens the underlying USB connection.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` `USB` instance
     * 
     * __Options__
     *  - __vendorId__ `Number` USB Vendor ID number, see: http://www.linux-usb.org/usb.ids
     *  - __productId__ `Number` USB Product ID number
     *  - __outEndpoint__ `Number` number of output endpoint
     *  - __inEndpoint__ `Number` number of input endpoint
     *  - __timeoutMillis__ `Number` max allowed duration of read/write/control operations (in milliseconds)
     */
    function USB(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            if (utils.hasPropertyWithType(opts, "handle", "number")) {
                this.handle = opts.handle;
            } else {
                var handleJson = wiltoncall("usb_open", opts);
                var handleObj = JSON.parse(handleJson);
                utils.checkPropertyType(handleObj, "usbHandle", "number");
                this.handle = handleObj.usbHandle;
            }
            utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    USB.prototype = {
        /**
         * @function read
         * 
         * Read data from device.
         * 
         * Tries to read a specified amount of data from the device.
         * Returned result can contain less data than requested.
         * Returns empty result if no data is available and timeout is exceeded.
         * 
         * USB bulk transfer is used to read the data.
         * 
         * Uses `timeoutMillis` parameter (specified in constructor) as a timeout.
         * 
         * @param length `Number` amount of the data to read (in bytes)
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `String` device response data in hexadecimal encoding, empty string on timeout
         */
        read: function(length, callback) {
            try {
                var res = wiltoncall("usb_read", {
                    usbHandle: this.handle,
                    length: length
                });
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },
        
        /**
         * @function writePlain
         * 
         * Write specifed string to device.
         * 
         * Writes specified string to device converting the bytes
         * of input string into hexadecimal encoding as-is without changing the UTF-16 encoding.
         * Using this method with non-ASCII symbols may lead to unexpected results.
         * 
         * To write UTF-8 bytes to device use `writeHex()` in conjunction with
         * `hex.encodeUTF8()`.
         * 
         * USB bulk transfer is used to write the data.
         * 
         * Uses `timeoutMillis` parameter (specified in constructor) as a timeout.
         * 
         * @param data `String` string to write to device
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Number` number of bytes written to device
         */
        writePlain: function(data, callback) {
            try {
                var resStr = wiltoncall("usb_write", {
                    usbHandle: this.handle,
                    dataHex: hex.encodeBytes(data)
                });
                var resObj = JSON.parse(resStr);
                utils.checkPropertyType(resObj, "bytesWritten", "number");
                var res = resObj.bytesWritten;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function writeHex
         * 
         * Write specifed string in hexadecimal encoding to device.
         * 
         * Writes specified hex-string to device, unlike `writePlain()` this
         * function may be used to write abritrary (possibly binary) data.
         * 
         * USB bulk transfer is used to write the data.
         * 
         * Uses `timeoutMillis` parameter (specified in constructor) as a timeout.
         * 
         * @param dataHex `String` string encoded as hexadecimal to write to device
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Number` number of bytes written to device
         */
        writeHex: function(dataHex, callback) {
            try {
                var resStr = wiltoncall("usb_write", {
                    usbHandle: this.handle,
                    dataHex: hex.uglify(dataHex)
                });
                var resObj = JSON.parse(resStr);
                utils.checkPropertyType(resObj, "bytesWritten", "number");
                var res = resObj.bytesWritten;
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function control
         * 
         * Communicate with USB device using control transfer.
         * 
         * Performs IO (write and read) with device using USB control transfer.
         * 
         * Input data can be provied either as plain bytes (`data` option)
         * or in hexadecimal encoding (`dataHex` option).
         * 
         * Output data is encoded as hexadecimal.
         * 
         * Uses `timeoutMillis` parameter (specified in constructor) as a timeout.
         * 
         * @param options `Object` configuration object, see possible options below
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `String` device response data in hexadecimal encoding, empty string on timeout
         * 
         * __Options__
         *  - __requestType__ `Number` request type field for the setup packet
         *  - __request__ `Number` request field for the setup packet
         *  - __value__ `Number` value field for the setup packet
         *  - __index__ `Number` index field for the setup packet
         *  - __data__ `String|Undefined` input data, either this option or `dataHex` must be specified
         *  - __dataHex__ `String|Undefined` input data in hexadecimal encoding
         */
        control: function(options, callback) {
            var opts = utils.defaultObject(options);
            try {
                var res = wiltoncall("usb_control", {
                    usbHandle: this.handle,
                    options: opts
                });
                return utils.callOrIgnore(callback, res);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function close
         * 
         * Close connection to device
         * 
         * Closes USB connection releases system resources.
         * Devices not closed manually, will be closed automatically during the shutdown.
         *
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        close: function(callback) {
            try {
                wiltoncall("usb_close", {
                    usbHandle: this.handle
                });
                return utils.callOrIgnore(callback);
            } catch (e) {
                return utils.callOrThrow(callback, e);
            }
        }
    };

    return USB;
});
