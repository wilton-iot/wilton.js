/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "wilton/Logger",
    "wilton/HttpClient",
    "wilton/shared",
    "wilton/utils"
], function(Logger, HttpClient, shared, utils) {
    "use strict";
    
    var logger = new Logger("wilton.natproxy.agent");
    
    return {
        job: function(conf) {
            utils.checkProperties(conf, [
                "clientHandle", 
                "proxyGetUrl", 
                "proxyPostUrl",
                "endpointName",
                "endpointBaseUrl"]);
            var client = new HttpClient({
                handle: conf.clientHandle
            });
            logger.info("cron: polling");
            var resp = client.execute(conf.proxyGetUrl);
            if (200 === resp.responseCode) {
                logger.info(resp.data);
                var reqlist = JSON.parse(resp.data);
                for (var i = 0; i < reqlist.length; i++) {
                    var req = reqlist[i];
                    var sresp = client.execute(conf.endpointBaseUrl + req.path, {
                        data: req.data,
                        meta: {
                            method: req.method,
                            headers: req.headers
                        }
                    });
                    client.execute(conf.proxyPostUrl, {
                        data: sresp.data,
                        meta: {
                            method: "POST"
                        }
                    });
                }
            }
        }
    };
});
