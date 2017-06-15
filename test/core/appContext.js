/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([
    "wilton/HttpClient",
    "wilton/shared"
], function(HttpClient, shared) {
    "use strict";
    
    var config = shared.get("wilton.test.core.config");

    return {
        config: config,
        
        httpClient: shared.getFromHandle({
            type: HttpClient,
            key: config.httpClientKey
        })
    };
});

