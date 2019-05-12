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
 * @namespace backendcall
 * 
 * __wilton/backendcall__ \n
 * Process remote calls over WebSocket.
 * 
 * This module allows to call RequireJS modules with
 * a messages received over WebSocket in conjunction with `web_wsClient` module
 * 
 * Usage example:
 * 
 * @code
 * 
 * // inside the WebSocket view handler
 * WSMESSAGE: function(req) {
 *    logger.info("WebSocket message received, data: [" + req.data() + "]");
 *    var resp = backendcall(req.data());
 *    req.sendWebSocket(resp);
 * }
 * 
 * @endcode
 */
define([
    "wilton/utils"
], function(utils) {
    "use strict";

    /**
     * @function backendcall
     * 
     * Process remote calls over WebSocket.
     * 
     * Call RequireJS modules with
     * a messages received over WebSocket in conjunction with `web_wsClient`.
     * 
     * @param message `String` message from `web_wsClient` received over WebSocket
     * @return `Object` resulting value of the module call
     */
    function backendcall(message) {
        var messageId = "unspecified";
        try {
            var msg = JSON.parse(message);
            if ("object" !== typeof(msg) || "string" !== typeof(msg.messageId)) {
                throw new Error("Invalid message received");
            }
            messageId = msg.messageId;
            if ("object" !== typeof(msg.payload) ||
                    "string" !== typeof(msg.payload.module)) {
                throw new Error("Invalid call description specified");
            }
            var res = WILTON_run(JSON.stringify(msg.payload, null, 4));
            // android workaround
            if ("object" === typeof(res) && null !== res && 
                    "object" === typeof(res.class) &&
                    "class java.lang.String" === String(res.class)) {
                // for safe json stringify
                res = String(res);
            }
            // WILTON_run workaround
            if ("string" === typeof(res) && res.length > 0) {
                res = JSON.parse(res);
            }
            var response = {
                messageId: messageId,
                payload: res
            };
            return response;
        } catch(e) {
            var errmsg = utils.formatError(e, "Backend call error for message: [" + message +  "], ");
            var response = {
                messageId: messageId,
                error: errmsg
            };
            return response;
        }
    };

    return backendcall;
});
