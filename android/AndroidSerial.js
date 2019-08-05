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
    "wilton/hex",
    "wilton/Logger",
    "wilton/utils"
], function(hex, Logger, utils) {
    "use strict";
    var logger = new Logger("wilton/Serial");

    var Array = Packages.java.lang.reflect.Array;
    var Byte = Packages.java.lang.Byte;
    var JString = Packages.java.lang.String;
    var System = Packages.java.lang.System;
    var Context = Packages.android.content.Context;
    var UsbSerialDevice = Packages.com.felhr.usbserial.UsbSerialDevice;
    var UsbSerialInterface = Packages.com.felhr.usbserial.UsbSerialInterface;
    var D2xxManager = Packages.com.ftdi.j2xx.D2xxManager;
    var DeviceService = Packages.wilton.android.DeviceService;

    var deviceService = DeviceService.INSTANCE;

    function findDeviceByVidPid(devices, port) {
        var pparts = port.split(":");
        if (2 !== pparts.length) {
            throw new Error("Invalid 'port' specified: [" + port + "], must be: 'vid:pid' in hex");
        }
        var vid = parseInt(pparts[0], 16);
        var pid = parseInt(pparts[1], 16);
        var found = [];
        for (var i = 0; i < devices.length; i++) {
            var dev = devices[i];
            var dvid = dev.getVendorId();
            var dpid = dev.getProductId();
            if (vid === dvid && pid === dpid) {
                return dev;
            } else {
                found.push(dvid.toString(16) + ":" + dpid.toString(16));
            }
        }
        throw new Error("USB device not found," +
                " vid: [" + vid.toString(16) + "]" +
                " pid: [" + pid.toString(16) + "]" +
                " available: [" + JSON.stringify(found, null, 4) + "]");
    }

    function openFTDI(options, device) {
        var man = D2xxManager.getInstance(deviceService);
        var count = man.createDeviceInfoList(deviceService);
        logger.debug("FTDI devices count: [" + count + "]");
        if (0 === count) {
            throw new Error("FTDI USB device is not connected");
        }
        var vpa = man.getVIDPID();
        var idx = 0;
        var success = false;
        var found = [];
        var vid = device.getVendorId();
        var pid = device.getProductId();
        logger.debug("Connecting to device, vid: [" + vid.toString(16) + "]," +
                " pid: [" + pid.toString(16) + "]");
        for (; idx < vpa.length; idx++) {
            var dvid = vpa[i][0];
            var dpid = vpa[i][1];
            if (vid === dvid && pid === dpid) {
                success = true;
                break;
            } else {
                found.push(dvid.toString(16) + ":" + dpid.toString(16));
            }
        }
        if (!success) {
            throw new Error("FTDI USB device not found," +
                    " vid: [" + vid.toString(16) + "]" +
                    " pid: [" + pid.toString(16) + "]" +
                    " available: [" + JSON.stringify(found, null, 4) + "]");
        }
        var dev = man.openByIndex(deviceService, idx);
        dev.setBaudRate(options.baudRate);
        dev.setDataCharacteristics(options.byteSize, options.stopBitsCount, D2xxManager.FT_PARITY_NONE);
        dev.setFlowControl(D2xxManager.FT_FLOW_NONE, 0, 0);
        dev.syncRead = function(buf, timeout) {
            return dev.read(buf, buf.length, timeout);
        };
        dev.syncWrite = function(buf/*, timeout */) {
            return dev.write(buf);
        };
        dev.syncClose = dev.close;

        this.port = dev;
    }

    function openSerial(options, device) {
        var supported = UsbSerialDevice.isSupported(device);
        if (!supported) {
            throw new Error("This USB device is not supported");
        }
        var vid = device.getVendorId();
        var pid = device.getProductId();
        logger.debug("Connecting to device, vid: [" + vid.toString(16) + "]," +
                " pid: [" + pid.toString(16) + "]");
        var uman = deviceService.getSystemService(Context.USB_SERVICE);
        var connection = uman.openDevice(device);
        var dev = UsbSerialDevice.createUsbSerialDevice(device, connection);
        var opened = dev.syncOpen();
        if (!opened) {
            throw new Error("Unable to open USB device");
        }
        dev.setBaudRate(options.baudRate);
        dev.setDataBits(options.byteSize);
        dev.setStopBits(options.stopBitsCount);
        dev.setParity(UsbSerialInterface.PARITY_NONE);
        dev.setFlowControl(UsbSerialInterface.FLOW_CONTROL_OFF);

        this.port = dev;
    }

    var AndroidSerial = function(options) {
        utils.checkProperties(options, ["port", "baudRate", "byteSize", "stopBitsCount", "timeoutMillis"]);
        logger.debug("Opening serial connection, timeout: [" + options.timeoutMillis + "] ...");
        
        // list devices
        var uman = deviceService.getSystemService(Context.USB_SERVICE);
        var devices = uman.getDeviceList().values().toArray();
        if (0 === devices.length) {
            throw new Error("No USB devices found");
        }

        var device = findDeviceByVidPid(devices, options.port);

        if (0x403 === device.getVendorId()) { // ftdi
            this.port = openFTDI(options, device);
        } else { // other devices
            this.port = openSerial(options, device);
        }
        this.timeoutMillis = options.timeoutMillis;
        logger.debug("Connection opened");
    };

    AndroidSerial.prototype = {

        read: function(len) {
            logger.debug("Reading from serial connection, length: [" + len + "] ...");
            var msg = [];
            var read = 0;
            var elapsed = 0;
            var start = Date.now();
            var now = start;
            while(read < len && elapsed < this.timeoutMillis) {
                var tm = this.timeoutMillis - elapsed;
                var rbuf = Array.newInstance(Byte.TYPE, len - read);
                var rd = this.port.syncRead(rbuf, tm);
                if (rd > 0) {
                    // serial may report incorrect read size
                    var rdc = rd < rbuf.length ? rd : rbuf.length;
                    read += rdc;
                    for (var i = 0; i < rdc; i++) {
                        msg.push(String.fromCharCode(rbuf[i] & 0xff));
                    }
                }
                now = Date.now();
                elapsed = now - start;
            }
            var res = hex.encodeBytes(msg.join(""));
            logger.debug("Read operation complete," +
                    " bytes read: [" + msg.length + "]," +
                    " data: [" + hex.formatHexAndPlain(res) + "]");
            return res;
        },

        readLine: function() {
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
                    var ch = String.fromCharCode(rbuf[0] & 0xff);
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
            var res = hex.encodeBytes(msg.join(""));
            logger.debug("Read operation complete," +
                    " bytes read: [" + (res.length/2) + "]," +
                    " data: [" + hex.formatHexAndPlain(res) + "]");
            return res;
        },

        writePlain: function(msg) {
            return this.writeHex(hex.encodeBytes(msg));
        },

        writeHex:function(hmsg) {
            logger.debug("Writing data to serial connection," +
                    " data: [" + hex.formatHexAndPlain(hmsg) +  "]," +
                    " data_len: [" + (hex.uglify(hmsg).length/2) +  "] ...");
            var msg = hex.decodeBytes(hmsg);
            var bytes = new JString(msg).getBytes();
            var written = 0;
            var elapsed = 0;
            var start = Date.now();
            var now = start;
            while (written < bytes.length && elapsed < this.timeoutMillis) {
                var tm = this.timeoutMillis - elapsed;
                var wbuf = Array.newInstance(Byte.TYPE, bytes.length - written);
                System.arraycopy(bytes, written, wbuf, 0, wbuf.length);
                var wr = this.port.syncWrite(bytes, tm);
                // serial may report wrong write size
                var cwr = wr < wbuf.length ? wr : wbuf.length;
                written += cwr;

                now = Date.now();
                elapsed = now - start;
            }
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
