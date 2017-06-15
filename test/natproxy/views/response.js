/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([
    "wilton/test/natproxy/appContext",
    "wilton/natproxy/proxy"
], function(ctx, proxy) {
    "use strict";

    return {
        POST: function(req) {
            proxy.postResponse({
                dbConn: ctx.dbConn, 
                req: req
            });
        }
    };
});

