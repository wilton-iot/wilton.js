/*
 * Copyright 2019, alex at staticlibs.net
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

define([
    "../hex",
    "../Logger",
    "../utils"
], function(hex, Logger, utils) {
    "use strict";
    var logger = new Logger("wilton/Serial");

    var Array = Packages.java.lang.reflect.Array;
    var Byte = Packages.java.lang.Byte;
    var JString = Packages.java.lang.String;
    var Context = Packages.android.content.Context;
    var UsbSerialDevice = Packages.com.felhr.usbserial.UsbSerialDevice;
    var UsbSerialInterface = Packages.com.felhr.usbserial.UsbSerialInterface;
    var MainActivity = Packages.wilton.android.MainActivity;

    var mainActivity = MainActivity.INSTANCE;

    var AndroidSerial = function(options) {
        utils.checkProperties(options, ["baudRate", "byteSize", "stopBitsCount", "timeoutMillis"]);
        logger.debug("Opening serial connection, timeout: [" + options.timeout + "] ...");

        var usbManager = mainActivity.getSystemService(Context.USB_SERVICE);
        var usbDevices = usbManager.getDeviceList().values().toArray();
        // todo: device search by vid:pid
        if (0 === usbDevices.length) {
            throw new Error("USB device is not connected");
        }
        var device = usbDevices[0];
        var supported = UsbSerialDevice.isSupported(device);
        if (!supported) {
            throw new Error("This USB device is not supported");
        }
        var connection = usbManager.openDevice(device);

        this.port = UsbSerialDevice.createUsbSerialDevice(device, connection);
        this.port.setBaudRate(options.baudRate);
        this.port.setDataBits(options.byteSize);
        this.port.setStopBits(options.stopBitsCount);
        this.port.setParity(UsbSerialInterface.PARITY_NONE);
        this.port.setFlowControl(UsbSerialInterface.FLOW_CONTROL_OFF);
        this.timeoutMillis = options.timeoutMillis;
        var opened = this.port.syncOpen();
        if (!opened) {
            throw new Error("Unable to open USB device");
        }
        logger.debug("Connection opened");
    };

    AndroidSerial.prototype = {

        read(len) {
            logger.debug("Reading from serial connection, length: [" + len + "] ...");
            var msg = [];
            /*
            var read = 0;
            var elapsed = 0;
            var start = Date.now();
            var now = start;
            while(read < len && elapsed < this.timeoutMillis) {
                var tm = this.timeoutMillis - elapsed;
                var rbuf = Array.newInstance(Byte.TYPE, len - read);
                var rd = this.port.syncRead(rbuf, tm);
                if (rd > 0) {
                    read += rd;
                    for (var i = 0; i < rd; i++) {
                        msg.push(String.fromCharCode(rbuf[i]));
                    }
                }
                now = Date.now();
                elapsed = now - start;
            }
             */
            var rbuf = Array.newInstance(Byte.TYPE, len);
            var rd = this.port.syncRead(rbuf, this.timeoutMillis);
            if (rd > 0) {
                var rdc = rd < rbuf.length ? rd : rbuf.length;
                for (var i = 0; i < rdc; i++) {
                    msg.push(String.fromCharCode(rbuf[i]));
                }
            }
            var res = hex.encodeUTF8(msg.join(""));
            logger.debug("Read operation complete," +
                    " bytes read: [" + (res.length/2) + "]," +
                    " data: [" + hex.formatHexAndPlain(res) + "]");
            return res;
        },

        readLine() {
            logger.debug("Reading a line from serial connection ...");
            var msg = [];
            var elapsed = 0;
            var start = Date.now();
            var now = start;
            while (elapsed < this.timeoutMillis) {
                var tm = this.timeoutMillis - elapsed;
                var rbuf = Array.newInstance(Byte.TYPE, 1);
                var read = this.port.syncRead(rbuf, tm);
                if (read > 0) {
                    var ch = String.fromCharCode(rbuf[0]);
                    if ("\n" === ch) {
                        if (msg.length > 0 && "\r" === msg[msg.length - 1]) {
                            msg.pop();
                        }
                        break;
                    } else {
                        msg.push(ch);
                    }
                }
                now = Date.now();
                elapsed = now - start;
            }
            var res = hex.encodeUTF8(msg.join(""));
            logger.debug("Read operation complete," +
                    " bytes read: [" + (res.length/2) + "]," +
                    " data: [" + hex.formatHexAndPlain(res) + "]");
            return res;
        },

        // todo: partial writes
        writePlain(msg) {
            return this.writeHex(hex.encodeUTF8(msg));
        },

        // todo: partial writes
        writeHex(hmsg) {
            logger.debug("Writing data to serial connection," +
                    " data: [" + hex.formatHexAndPlain(hmsg) +  "]," +
                    " data_len: [" + (hex.uglify(hmsg).length/2) +  "] ...");
            var msg = hex.decodeUTF8(hmsg);
            var bytes = new JString(msg).getBytes();
            var written = this.port.syncWrite(bytes, this.timeoutMillis);
            logger.debug("Write operation complete," +
                    " bytes written: [" + written + "]");
            return written;
        },

        close: function() {
            logger.debug("Closing serial connection ...");
            this.port.syncClose();
            logger.debug("Connection closed");
        }
    };

    return AndroidSerial;

});
