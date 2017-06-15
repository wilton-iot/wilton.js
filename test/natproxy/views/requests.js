/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([
    "../appContext",
    "wilton/natproxy/proxy"
], function(ctx, proxy) {
    "use strict";
    
    return {
        GET: function(req) {
            proxy.getRequests({
                req:req,
                dbConn: ctx.dbConn,
                emptyStatusCode: ctx.conf.emptyStatusCode,
                maxRequestRecords: ctx.conf.maxRequestRecords
            });
        }
    };
});

