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
 * @namespace web_wsClient
 * 
 * __wilton/web/wsClient__ \n
 * WebSocket client for web-browsers.
 * 
 * This module allows to use WebSockets in web-browsers
 * using "request-response" and "pub-sub" modes.
 * 
 * Protocol:
 * 
 *  - client request: `{ messageId: "uid", payload: msg }`
 * 
 *  - server response: `{ messageId: "uid", payload: msg }`
 * 
 *  - server broadcast: `{ broadcast: "topic", payload: msg }`
 * 
 * Usage example:
 * 
 * @code
 * 
 * // open connection
 * ws.open("ws://127.0.0.1:8080/views/wsView", function(err, socket) {
 *     if (err) { ... }
 * 
 *     // send
 *     ws.send(socket, {
 *         foo: 42
 *     }, function(err, resp) {
 *         if (err) { ... }
 *         console.log(resp);
 *     });
 * 
 *     // subscribe for broadcast
 *     ws.subscribe(socket, "myTopic", function(err, msg) {
 *         if (err) { ... }
 *         console.log(msg);
 *     });
 * 
 *     // close
 *     // ws.close(socket);
 * });
 * 
 * @endcode
 */
define([], function() {
    "use strict";

    // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
    var READY_STATE_OPEN = 1;
    // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#Constants
    var WEB_SOCKET_CLOSING = 2; 
    var WEB_SOCKET_CLOSED = 3;

    // https://stackoverflow.com/a/21963136/314015
    var UUID_LOOKUP_TABLE = [];
    for (var i = 0; i < 256; i++) {
        UUID_LOOKUP_TABLE[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }

    function uuidgen() {
        // random
        var dvals = null;
        if ("object" === typeof(window.crypto) && "function" === typeof(window.crypto.getRandomValues)) {
            dvals = new Uint32Array(4);
            window.crypto.getRandomValues(dvals);
        } else {
            var mr = function() {
                return (Math.random() * 0xffffffff) >>> 0;
            };
            dvals = [mr(), mr(), mr(), mr()];
        }
        // uuid
        var d0 = dvals[0];
        var d1 = dvals[1];
        var d2 = dvals[2];
        var d3 = dvals[3];
        var lut = UUID_LOOKUP_TABLE;
        return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
                lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' +
                lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
                lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + 
                lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    }

    function listProperties(obj) {
        var res = [];
        for (var pr in obj) {
            if (obj.hasOwnProperty(pr)) {
                res.push(pr);
            }
        }
        return res;
    }

    function defaultOptions(options) {
        var opts = {};
        if ("object" === typeof(options)) {
            opts = options;
        }
        opts.idGenerator = opts.idGenerator || uuidgen;
        opts.onError = opts.onError || function(obj) {
             console.error(obj);
        };
        opts.logger = opts.logger || function(obj) {
             console.log(obj);
        };
        opts.timeoutMillis = opts.timeoutMillis || 10000;
        return opts;
    }

    function checkOptions(options) {
        if ("object" !== typeof(options) ||
                "function" !== typeof(options.idGenerator) ||
                "function" !== typeof(options.onError) ||
                "function" !== typeof(options.logger) ||
                "number" !== typeof(options.timeoutMillis)) {
            throw new Error("Invalid options specified: [" + listProperties(options) + "]");
        }
    }

    function defaultCallback(options, callback) {
        var cb = callback;
        if ("undefined" === typeof(callback) && "function" === typeof(options)) {
            cb = options;
        }
        return cb;
    }

    function checkCallback(callback) {
        if ("function" !== typeof(callback)) {
            throw new Error("Invalid non-function callback specified");
        }
    }

    function checkSocket(socket) {
        if ("object" !== typeof(socket) ||
                "undefined" === typeof(socket.ws) || 
                null === socket.ws ||
                "object" !== typeof(socket.opts) || 
                "object" !== typeof(socket.receivers) || 
                "object" !== typeof(socket.subscribers)) {
            throw new Error("Invalid socket specified: [" + listProperties(socket) + "]");
        }
    }

    function checkUrl(url) {
        if ("string" !== typeof(url) && 0 !== url.indexOf("ws")) {
            throw new Error("Invalid url specified: [" + url + "]");
        }
    }

    function checkTopic(topic) {
        if ("string" !== typeof(topic) || 0 === topic.length) {
            throw new Error("Invalid topic specified: [" + topic + "]");
        }
    }

    function receivePayload(socket, id, payload) {
        var cb = socket.receivers[id];
        if ("undefined" !== typeof(cb)) {
            delete socket.receivers[id];
            cb(null, payload);
        }
    }

    function receiveError(socket, id, error) {
        var cb = socket.receivers[id];
        if ("undefined" !== typeof(cb)) {
            delete socket.receivers[id];
            cb(error);
        }
    }

    function receiveBroadcast(socket, topic, payload) {
        var list = socket.subscribers[topic];
        if ("undefined" !== typeof(list)) {
            for (var i = 0; i < list.length; i++) {
                try {
                    list[i](null, payload);
                } catch(e) {
                    socket.opts.onError(e);
                }
            }
        }
    }

    function onMessage(socket, event) {
        var msg = JSON.parse(event.data);
        socket.opts.logger({
            wsClientIncoming: msg
        });
        if ("object" !== typeof(msg)) {
            throw new Error("Invalid message received");
        }
        if ("string" === typeof(msg.messageId)) {
            if ("undefined" !== typeof(msg.error)){
                receiveError(socket, msg.messageId, msg.error);
            } else {
                receivePayload(socket, msg.messageId, msg.payload);
            }
        } else if ("string" === typeof(msg.broadcast)) {
            receiveBroadcast(socket, msg.broadcast, msg.payload);
        } else {
            throw new Error("Invalid unknown message received");
        }
    }

    function onOpen(socket) {
        socket.ws.onmessage = function(event) {
            try {
                onMessage(socket, event);
            } catch(e) {
                socket.opts.onError(event);
                socket.opts.onError(e);
            }
        };
        socket.ws.onerror = function(event) {
            socket.opts.onError(event);
        };
    }

    /**
     * @function open
     * 
     * Open WebSocket connection to server.
     * 
     * Opens WebSocket connection to server, calls callback on connection
     * established or on timeout.
     * 
     * @param url `String` URL of the WebSocket server
     * @param options `Object|Undefined` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive opened `Socket` or error
     * @returns `Undefined`
     * 
     * __Options__
     * 
     *  - __idGenerator__ `Function|Undefined` function that generates unique ID's
     *                    for WS messages, default value: `UUID` generator
     *  - __logger__ `Function|Undefined` function that is called with a wrapped WS message
     *               for each outgoing and incoming message, default value: `console.log()`
     *  - __onError__ `Function|Undefined` function that is called with error message or event
     *                 object on communication error, default value: `console.error()`
     *  - __timeoutMillis__ `Number|Undefined` timeout in milliseconds awaiting for a server
     *                      response to WS message, default value: `10000`
     */
    function open(url, options, callback) {
        checkUrl(url);
        var opts = defaultOptions(options);
        checkOptions(opts);
        var cb = defaultCallback(options, callback);
        checkCallback(cb);

        // try to open connection
        var ws = new WebSocket(url);

        // state
        var socket = {
            ws: ws,
            opts: opts,
            receivers: {},
            subscribers: {}
        };

        // success
        ws.onopen = function() {
            onOpen(socket);
            cb(null, socket);
        };

        // error
        ws.onerror = function(event) {
            cb(event);
        };
    }

    /**
     * @function send
     * 
     * Send message to WebSocket server.
     * 
     * Sends message to WebSocket server, calls specified callback
     * with a server response or on timeout
     * 
     * @param socket `Object` `Socket` previously opened with `open()`
     * @param message `Object|Array|String` message payload that is passed to server
     * @param callback `Function|Undefined` callback to receive response or error
     * @returns `Undefined`
     * 
     */
    function send(socket, message, callback) {
        checkSocket(socket);
        checkCallback(callback);

        // check open
        if (READY_STATE_OPEN !== socket.ws.readyState) {
            callback(new Error("Socket closed"));
            return;
        }

        // wrap message
        var id = socket.opts.idGenerator();
        var envelope = {
            messageId: id,
            payload: message
        };
        var envstr = JSON.stringify(envelope, null, 4);

        // register receiver
        socket.receivers[id] = callback;
        setTimeout(function() {
            var cb = socket.receivers[id];
            if ("undefined" !== typeof(cb)) {
                delete socket.receivers[id];
                cb("Timeout exceeded, millis: [" + socket.opts.timeoutMillis + "]," +
                        " message: [" + envstr + "]");
            }
        }, socket.opts.timeoutMillis);

        // send message
        socket.opts.logger({
            wsClientOutgoing: envelope
        });
        socket.ws.send(envstr);
    }

    /**
     * @function subscribe
     * 
     * Subscribe to broadcasts from WebSocket server.
     * 
     * Subscribes to broadcasts from WebSocket server,
     * callback is called for each message that is broadcasted
     * for the specified topic.
     * 
     * @param socket `Object` `Socket` previously opened with `open()`
     * @param topic `String` topic name to recive broadcast on
     * @param callback `Function` callback to receive broadcasted message or error
     * @returns `Undefined`
     * 
     */
    function subscribe(socket, topic, callback) {
        checkSocket(socket);
        checkTopic(topic);

        // check open
        if (READY_STATE_OPEN !== socket.ws.readyState) {
            throw new Error("Socket closed");
        }

        // add subscriber
        var list = socket.subscribers[topic];
        if ("undefined" !== typeof(list)) {
            list.push(callback);
        } else {
            socket.subscribers[topic] = [callback];
        }
    }

    /**
     * @function close
     * 
     * Close WebSocket connection.
     * 
     * Closes WebSocket connection.
     * 
     * @param socket `Object` `Socket` previously opened with `open()`
     * @returns `Undefined`
     */
    function close(socket) {
        checkSocket(socket);
        socket.ws.close();
    }

    /**
     * @function isOpen
     * 
     * Check whether WebSocket connnection is open.
     * 
     * Checks whether WebSocket connection is not in 'CLOSED' or 'CLOSING' state.
     * 
     * @param socket `Object` `Socket` previously opened with `open()`
     * @returns `Undefined`
     */
    function isOpen(socket) {
        checkSocket(socket);
        var st = socket.ws.readyState;
        return WEB_SOCKET_CLOSED !== st && WEB_SOCKET_CLOSING !== st;
    }

    return {
        open: open,
        send: send,
        subscribe: subscribe,
        close: close,
        isOpen: isOpen
    };
});
