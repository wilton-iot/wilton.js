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
 * TCP (TODO: and UDP) protocols are supported for both "client" and "server"
 * operations. Implementation uses async IO underneath, but
 * all operations are always done on the caller thread,
 * effectively providing a synchronous API.
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
 * // read data from seocket, specify 'bytesToRead'
 * // to read the exact number of bytes
 * var received = socket.read({
 *     timeoutMillis: 100
 * });
 * 
 * // write to socket
 * socket.write({
 *     data: "HELO",
 *     timeoutMillis: 100
 * });
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
     * Creates a TCP or UDP socket and establishes the networking connections.
     * For client sockets - opens the connection to server.
     * For server sockets - bind to the specified local address
     * and (for TCPfor TCPfor TCPfor TCP) accepts the incoming connection.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` `Socket` instance
     * 
     * __Options__
     *  - __todo__ `String` TODO
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
         * @function write
         * 
         * Write data to the socket.
         * 
         * Writes the specified data to this socket. If this call returned
         * without throwing an exception, that means that the whole
         * specified data was written to the socket.
         * 
         * @param options `Object` configuration object, see possible options below
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         * 
         * __Options__
         *  - __data__ `String` data to write
         *  - __timeoutMillis__ `Number` max number of milliseconds allowed
         *                      to write the specified data to this socket
         *  - __hex__ `Boolean|Undefined` whether the specified `data` is in
         *            hexadecimal encoding and must be decoded before being
         *            written to socker; `false` by default.
         *  
         */
        write: function(options, callback) {
            var opts = utils.defaultObject(options);
            try {
                opts.socketHandle = this.handle;
                wiltoncall("net_socket_write", opts);
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function read
         * 
         * Read data to the socket.
         * 
         * Reads the data from this socket. If `bytesToRead` parameter
         * specified - then the result, returned from this function without throwing the
         * exception will always contains specified amount of bytes.
         * 
         * If `bytesToRead` parameter is not specified - arbitrary number of bytes of data
         * may be returned and 0 bytes are returned on timeout.
         * 
         * @param options `Object` configuration object, see possible options below
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         * 
         * __Options__
         *  - __timeoutMillis__ `Number` max number of milliseconds allowed
         *                      to read the specified (or unspecified) number of bytes
         *  - __bytesToRead__ `Number|Undefined` number of bytes to read
         *  - __hex__ `Boolean|Undefined` whether the specified `data` is in
         *            hexadecimal encoding and must be decoded before being
         *            written to socker; `false` by default.
         *  
         */
        read: function(options, callback) {
            var opts = utils.defaultObject(options);
            try {
                opts.socketHandle = this.handle;
                var resNullable = wiltoncall("net_socket_read", opts);
                var res = null !== resNullable ? resNullable : "";
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
