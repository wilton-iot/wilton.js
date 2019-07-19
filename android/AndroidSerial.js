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
    "../utils"
], function(hex, utils) {
    "use strict";

    var Array = Packages.java.lang.reflect.Array;
    var Byte = Packages.java.lang.Byte;
    var JString = Packages.java.lang.String;
    var Context = Packages.android.content.Context;
    var UsbSerialDevice = Packages.com.felhr.usbserial.UsbSerialDevice;
    var UsbSerialInterface = Packages.com.felhr.usbserial.UsbSerialInterface;
 

    var MainActivity = Packages.wilton.android.MainActivity;

    var mainActivity = MainActivity.INSTANCE;

    var AndroidSerial = function(options) {
//        utils.checkProperties(...);

        
        var usbManager = mainActivity.getSystemService(Context.USB_SERVICE);
        var usbDevices = usbManager.getDeviceList().values().toArray();
        var device = usbDevices[0];
        var supported = UsbSerialDevice.isSupported(this.device);
        var connection = usbManager.openDevice(this.device);

        this.serial = UsbSerialDevice.createUsbSerialDevice(device, connection);
        this.serial.setBaudRate(9600);
        this.serial.setDataBits(UsbSerialInterface.DATA_BITS_8);
        this.serial.setStopBits(UsbSerialInterface.STOP_BITS_1);
        this.serial.setParity(UsbSerialInterface.PARITY_NONE);
        this.serial.setFlowControl(UsbSerialInterface.FLOW_CONTROL_OFF);
        var opened = serial.syncOpen();
        
    };

/*
    AndroidSerial.prototype = {
        
        read: function() {
            var start = Date.now();
            var elapsed = 0;
            var read = 0;
            var rbuf = Array.newInstance(Byte.TYPE, 1);
            var res = [];
            while (read < length && elapsed < timeout) {
                var len = this.serial.syncRead(rbuf, 1000);
                if (len > 0) {
                    read += 1;
                    res.push(String.fromCharCode(rbuf[0]));
                }
            }
            return hex.encodeUTF8(res.join(""));
        },

        readLine: function() {
            var start = Date.now();
            var elapsed = 0;
            var read = 0;
            var rbuf = Array.newInstance(Byte.TYPE, 1);
            var res = [];
            while (elapsed < timeout) {
                var len = this.serial.syncRead(rbuf, 1000);
                if (len > 0) {
                    read += 1;
                    res.push(String.fromCharCode(rbuf[0]));
                }
                if ("\n" === res) {
                    break;
                }
            }
            return hex.encodeUTF8(res.join(""));
        },

        writePlain: function(data) {
            return this.serial.syncWrite(new JString(data).getBytes(), 1000);
        },

        writeHex: function(datahex) {
            var data = hex.decodeUTF8(datahex);
            return this.serial.syncWrite(new JString(data).getBytes(), 1000);
        },

        close: function() {
            this.serial.syncClose();
        }
    };
 */

    return AndroidSerial;

});
