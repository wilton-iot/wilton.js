/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./Response", "./Logger", "./utils"], function(Response, Logger, utils) {
    "use strict";

    var logger = new Logger("wilton.gateway");

    return function(callbackModule, requestHandle) {
        try {     
            // load callback module, expected to by sync
            require([callbackModule], function(mod) {
                // prepare handle arg
                var ha = JSON.stringify({
                    requestHandle: requestHandle
                });
                // get request metadata
                var json = wiltoncall("request_get_metadata", ha);
                var req = JSON.parse(json);
                // check callback exists for input method
                var cb = mod[req.method];
                if ("function" !== typeof(cb)) {
                    throw new Error("Gateway error: request method is not supported by callback," +
                            " module name: [" + callbackModule + "]," + 
                            " module properties: [" + utils.listProperties(mod) + "]," + 
                            " method: [" + req.method + "]");
                }
                // get request data
                req.data = "";
                if ("POST" === req.method || "PUT" === req.method) {
                    var bdata = wiltoncall("request_get_data", ha);
                    req.data = "" + bdata;
                }
                // create response obj
                var resp = new Response(requestHandle);
                // fire callback
                cb(req, resp);
            });        
        } catch (e) {
            logger.error(e);
            wiltoncall("request_set_response_metadata", JSON.stringify({
                requestHandle: requestHandle,
                metadata: {
                    statusCode: 500,
                    statusMessage: "Server Error"
                }
            }));
            wiltoncall("request_send_response", JSON.stringify({
                requestHandle: requestHandle,
                data: JSON.stringify({
                    code: 500,
                    message: "Server Error",
                    description: e.message
                })
            }));
        }
    };
});
