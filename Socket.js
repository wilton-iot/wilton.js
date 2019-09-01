/*
 * Copyright 2018, alex at staticlibs.net
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
 * @namespace Socket
 * 
 * __wilton/Socket__ \n
 * Networking sockets.
 * 
 * This module provides access to networking sockets API.
 * 
 * TCP and UDP protocols are supported for both "client" and "server"
 * operations. Implementation uses async IO underneath, but
 * all operations are always done on the caller thread,
 * effectively providing a synchronous API.
 * 
 * Data from network is returned encoded in hexadecimal encoding, use `wilton/hex` for decoding.
 * 
 * Socket can be closed manually to release system resource, otherwise
 * it will be closed during the shutdown.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // open socket
 * var socket = new Socket({
 *     ipAddress: "127.0.0.1",
 *     tcpPort: 21,
 *     protocol: "TCP",
 *     role: "server",
 *     timeoutMillis: 500
 * });
 * 
 * // read data from socket
 * var received = socket.read(42);
 * 
 * // write to socket
 * socket.writePlain("HELO");
 * 
 * // close socket
 * socket.close();
 * 
 * @endcode
 */

define([
    "./dyload",
    "./utils",
    "./wiltoncall"
], function(dyload, utils, wiltoncall) {
    "use strict";

    dyload({
        name: "wilton_net"
    });

    /**
     * @function Socket
     * 
     * Create and open a networking socket.
     * 
     * Creates a TCP or UDP socket and establishes the networking connection.
     * For client sockets - opens the connection to server.
     * For server sockets - bind to the specified local address
     * and (for TCP) accepts the incoming connection.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` `Socket` instance
     * 
     * __Options__
     *  - __ipAddress__ `String` for `server` - IP address to bind to, for client:
     *                          address to connect to
     *  - __tcpPort__ `Number|Undefined` TCP port number
     *  - __udpPort__ `Number|Undefined` UDP port number
     *  - __protocol__ `String` networking protocol, supported values: `TCP`, `UDP`
     *  - __role__ `String` socket role, supported values: `client`, `server`
     *  - __timeoutMillis__ `Number` max number of milliseconds allowed
     *                      to establish the connection
     */
    var Socket = function(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var handleJson = wiltoncall("net_socket_open", opts);
            var handleParsed = JSON.parse(handleJson);
            this.handle = handleParsed.socketHandle;
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    Socket.prototype = {

        /**
         * @function read
         * 
         * Read data from the socket.
         * 
         * Tries to read a specified amount of data from the socket.
         * Returned result can contain less data than requested.
         * Returns empty string if no data is available and timeout is exceeded.
         * 
         * Uses `timeoutMillis` parameter (specified in constructor) as a timeout.
         * 
         * @param length `Number` amount of the data to read (in bytes)
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `String` device response data in hexadecimal encoding, empty string on timeout
         */
        read: function(length, callback) {
            try {
                var res = wiltoncall("net_socket_read", {
                    socketHandle: this.handle,
                    bytesToRead: length
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
         * Write specifed string to the socket.
         * 
         * Writes specified string to socket converting the bytes
         * of input string into hexadecimal encoding as-is without changing the UTF-16 encoding.
         * Using this method with non-ASCII symbols may lead to unexpected results.
         * 
         * To write UTF-8 bytes to socket use `writeHex()` in conjunction with
         * `hex.encodeUTF8()`.
         * 
         * Uses `timeoutMillis` parameter (specified in constructor) as a timeout.
         * 
         * @param data `String` string to write to socket
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Number` number of bytes written to socket
         */
        writePlain: function(data, callback) {
            try {
                var resStr = wiltoncall("net_socket_write", {
                    socketHandle: this.handle,
                    data: data,
                    hex: false
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
         * Write specifed string to the socket.
         * 
         * Write specifed string in hexadecimal encoding to socket.
         * 
         * Writes specified hex-string to socket, unlike `writePlain()` this
         * function may be used to write abritrary (possibly binary) data.
         * 
         * Uses `timeoutMillis` parameter (specified in constructor) as a timeout.
         * 
         * @param data `String` string to write to socket
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Number` number of bytes written to socket
         */
        writeHex: function(data, callback) {
            try {
                var resStr = wiltoncall("net_socket_write", {
                    socketHandle: this.handle,
                    data: data,
                    hex: true
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
         * Close the socket.
         * 
         * Closes this socket releasing system resources.
         * Socket left open will be closed on shutdown.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        close: function(callback) {
            try {
                wiltoncall("net_socket_close", {
                    socketHandle: this.handle
                });
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }
    };

    return Socket;
});
