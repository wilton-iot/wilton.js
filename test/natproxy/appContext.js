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
    
    return {
        config: shared.get("wilton.test.natproxy.config"),
        
        dbConn: connManager.open({
            url: this.config.dbUrl,
            sharedKey: this.config.connManagerKey
        }),
        
        httpClient: shared.getFromHandle({
            type: HttpClient,
            key: this.config.HttpClientKey
        })
    };
});

