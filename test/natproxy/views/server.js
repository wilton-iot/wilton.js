/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["wilton/Logger"], function(Logger) {
    "use strict";

    var logger = new Logger("wilton.test.natproxy.views.server");

    return {
        GET: function(req) {
            logger.info("GET view called");
            req.sendResponse({
                message: "hello from server",
                requestMethod: "GET",
                requestHeaders: req.getMetadata().headers
            });
        },
        POST: function(req) {
            logger.info("POST view called, data: [" + req.getData() + "]");
            req.sendResponse({
                message: "hello from server",
                requestMethod: "POST",
                requestHeaders: req.getMetadata().headers,
                requestData: req.getJson()
            });
        },
        PUT: function(req) {
            logger.info("PUT view called");
            req.sendResponse({
                message: "hello from server",
                requestMethod: "PUT",
                requestHeaders: req.getMetadata().headers,
                requestData: req.getJson()
            });
        },
        DELETE: function(req) {
            logger.info("DELETE view called");
            req.sendResponse({
                message: "hello from server",
                requestMethod: "DELETE",
                requestHeaders: req.getMetadata().headers
            });
        }
    };
});
