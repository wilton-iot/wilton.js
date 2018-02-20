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
 * This module provide a number of networking oprerations,
 * auxilary to the networking sockets API provided by `wilton/Socket` module.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // resolve hostname to a list of IP addresses
 * var ipList = net.resolveHostname({
 *     hostname: "github.com",
 *     timeoutMillis: 3000
 * });
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
     * @function resolveHostname
     * 
     * Find IP address for the specified hostname.
     * 
     * Finds the list of IPv4 addresses for the specified hostname. 
     * If call exits without exception, the returned list
     * of IP addresses is always non-empty.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Array` list of IP addresses
     * 
     * __Options__
     *  - __hostname__ `String` hostname to resolve
     *  - __timeoutMillis__ `Number` max wait time, in milliseconds
     */
    function resolveHostname(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var resJson = wiltoncall("net_resolve_hostname", opts);
            var res = JSON.parse(resJson);
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

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

    return {
        resolveHostname: resolveHostname,
        waitForTcpConnection: waitForTcpConnection
    };
});
