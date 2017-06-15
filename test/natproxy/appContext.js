/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([
    "wilton/HttpClient",
    "wilton/shared",
    "wilton/db/connManager"
], function(HttpClient, shared, connManager) {
    "use strict";
    
    var config = shared.get("wilton.test.natproxy.config"); 
    
    return {
        conf: config,
        
        dbConn: connManager.open({
            url: config.dbUrl,
            sharedKey: config.connManagerKey
        })
    };
});

