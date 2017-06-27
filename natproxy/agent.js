/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "wilton/Logger",
    "wilton/httpClient",
    "wilton/utils"
], function(Logger, http, utils) {
    "use strict";

    var logger = new Logger("wilton.natproxy.agent");

    function agentJob(conf) {
        utils.checkProperties(conf, [
            "proxyGetUrl",
            "proxyGetMetadata",
            "proxyPostUrl",
            "proxyPostMetadata",
            "endpointName",
            "endpointBaseUrl",
            "endpointRequestMetadata"]);
        logger.debug("polling");
        var resp = http.sendRequest(conf.proxyGetUrl + "?endpoint=" + conf.endpointName, {
            meta: conf.proxyGetMetadata
        });
        if (200 === resp.responseCode) {
            logger.debug(resp.data);
            var reqlist = JSON.parse(resp.data);
            logger.debug("Fetched requests, count: [" + reqlist.length + "]");
            for (var i = 0; i < reqlist.length; i++) {
                var req = reqlist[i];
                var meta = utils.clone(conf.endpointRequestMetadata);
                meta.method = req.method;
                meta.headers = JSON.parse(req.headers);
                logger.debug("Is due to query endpoint ...");
                var sresp = http.sendRequest(conf.endpointBaseUrl + req.path, {
                    data: req.data,
                    meta: meta
                });
                logger.debug("Got endpoint response, posting ...");
                http.sendRequest(conf.proxyPostUrl + "?endpoint=" + conf.endpointName + "&id=" + req.id, {
                    data: sresp.data,
                    meta: conf.proxyPostMetadata
                });
                logger.debug("Post complete");
            }
        }
    }
    
    return {
        agentJob: agentJob
    };
});
