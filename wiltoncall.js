/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./utils"], function(utils) {
    "use strict";
    
    return function(name, data) {
        if ("string" !== typeof (name) || !(name.length > 0)) {
            throw new Error("Invalid 'wiltoncall' parameters specified, name: [" + name + "]");
        }
        var json = utils.defaultJson(data);
        return WILTON_wiltoncall(name, json);
    };
});
