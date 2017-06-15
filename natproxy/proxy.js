/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([
    "wilton/Logger",
    "wilton/wiltoncall",
    "wilton/utils",
    "./db"
], function(Logger, wiltoncall, utils, db) {
    "use strict";
    
    var logger = new Logger("wilton.natproxy.proxy");
    
    function cleanupHeaders(headers) {
        delete headers.Host;
        delete headers.Accept;
        delete headers["Accept-Encoding"];
        delete headers["Transfer-Encoding"];
        delete headers.Expect;
    }
    
    function enqueueRequest(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            utils.checkProperties(opts, ["req", "dbConn", "waitTimeoutMillis", "timeoutStatusCode"]);
            var meta = opts.req.getMetadata();
            utils.checkProperties(meta.queries, ["endpoint", "path"]);
            var data = opts.req.getData();            
            cleanupHeaders(meta.headers);
            var req = {
                method: meta.method,
                path: meta.queries.path,
                headers: meta.headers,
                data: data
            };
            var id = db.genId(opts.dbConn);
            db.saveRequest(opts.dbConn, id, meta.queries.endpoint, req);
            logger.debug("Start waiting, id: [" + id + "]");
            var resp = wiltoncall("natproxy_wait_for_response", {
                id: id,
                endpoint: meta.queries.endpoint,
                timeoutMillis: opts.waitTimeoutMillis
            });
            logger.debug("End waiting, resp: [" + resp + "]");
            if (null !== resp) {
                opts.req.sendResponse(resp);
            } else {
                opts.req.sendResponse("", {
                    meta: {
                        statusCode: opts.timeoutStatusCode
                    }
                });
            }
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function getRequests(options, callback) {
        logger.debug("Looking for requests ...");
        var opts = utils.defaultObject(options);
        try {
            utils.checkProperties(opts, ["req", "dbConn", "emptyStatusCode"]);
            var meta = opts.req.getMetadata();
            utils.checkProperties(meta.queries, ["endpoint"]);
            var reqList = db.findRequestsForEndpoint(opts.dbConn, meta.queries.endpoint);
            var code = 0 === reqList.length ? opts.emptyStatusCode : 200;
            opts.req.sendResponse(reqList, {
                meta: {
                    statusCode: code
                }
            });
            logger.debug("Returned requests: [" + JSON.stringify(reqList) + "]");
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function postResponse(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            utils.checkProperties(opts, ["req", "dbConn"]);
            var meta = opts.req.getMetadata();
            utils.checkProperties(meta.queries, ["id", "endpoint"]);
            var id = parseInt(meta.queries.id, 10);
            var resp = opts.req.getJson();            
            wiltoncall("natproxy_notify_response", {
                id: id,
                endpoint: meta.queries.endpoint,
                response: resp
            });
            logger.info("Notified response, id: [" + id + "]");
            db.addResponse(opts.dbConn, id, resp);
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return {
        enqueueRequest: enqueueRequest,
        getRequests: getRequests,
        postResponse: postResponse
    };
});

