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
 * @namespace net
 * 
 * __wilton/net__ \n
 * Networking operations.
 * 
 * This module currently provides only one function: `waitForTcpConnection()` .
 * 
 * Usage example:
 * 
 * @code
 * 
 * // wait for the TCP endpoint to become available
 * net.waitForTcpConnection({
 *     ipAddress: "127.0.0.1",
 *     tcpPort: 8080,
 *     timeoutMillis: 10000
 * });
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
     * @function waitForTcpConnection
     * 
     * Wait for the remote TCP endpoint to become accessible.
     * 
     * Tries to connect to the specified TCP endpoint. Throws `Error` on timeout.
     * 
     * Intended to be used to check the state of the started HTTP server in
     * spawned process.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     * 
     * __Options__
     *  - __ipAddress__ `String` IPv4 network address
     *  - __tcpPort__ `Number` TCP port
     *  - __timeoutMillis__ `Number` max wait time, in milliseconds
     */
    function waitForTcpConnection(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            wiltoncall("net_wait_for_tcp_connection", opts);
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    function socketOpen(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var json = wiltoncall("net_socket_open", opts);
            var res = JSON.parse(json);
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }  
    }
    function socketClose(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var json = wiltoncall("net_socket_close", opts);
            var res = JSON.parse(json);
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }  
    }
    function socketWrite(options, callback) {
      var opts = utils.defaultObject(options);
        try {
            var json = wiltoncall("net_socket_write", opts);
            var res = JSON.parse(json);
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }  
    }
    function socketRead(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var string = wiltoncall("net_socket_read", opts);
            utils.callOrIgnore(callback, string);
            return string;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return {
        waitForTcpConnection: waitForTcpConnection,
        socketOpen:  socketOpen,
        socketClose: socketClose,
        socketWrite: socketWrite,
        socketRead:  socketRead
    };
});
