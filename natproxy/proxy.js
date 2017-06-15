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
    
    var logger = new Logger("wilton.natproxy.gateway");
    
    function cleanupHeaders(headers) {
        delete headers.Host;
        delete headers.Accept;
        delete headers["Accept-Encoding"];
        delete headers["Transfer-Encoding"];
        delete headers.Expect;
    }
    
    function enqueueRequest(conn, req) {
        var meta = req.getMetadata();
        utils.checkProperties(meta.queries, ["endpoint", "path"]);
        var data = req.getData();
        cleanupHeaders(meta.headers);
        var req = {
            method: meta.method,
            path: meta.queries.path,
            headers: meta.headers,
            data: data
        };
        var id = db.genId();
        db.saveRequest(conn, id, req);
        wiltoncall("natproxy_wait_for_response", {
            id: id,
            endpoint: meta.queries.endpoint,
            timeoutMillis: 5000 // todo: fixme
        });
    }
    
    function getRequests(conn, req) {
        var meta = req.getMetadata();
        utils.checkProperties(meta.queries, ["endpoint"]);
        var reqList = db.findRequestsForEndpoint(conn, meta.queries.endpoint);
        var meta = {};
        if (0 === reqList.length) {
            meta.statusCode = 204;
        }
        req.sendResponse(reqList, meta);
    }
    
    function postResponse(conn, req) {
        var meta = req.getMetadata();
        utils.checkProperties(meta.queries, ["id", "endpoint"]);
        var id = parseInt(meta.queries.id, 10);
        var resp = req.getJson();
        wiltoncall("natproxy_notify_response", {
        id: id,
                endpoint: meta.queries.endpoint,
                response: resp
        });
        db.addResponse(conn, id, resp);
}

    return {
        enqueueRequest: enqueueRequest,
        getRequests: getRequests,
        postResponse: postResponse
    };
});

