/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["wilton/Channel"], function(Channel) {
    "use strict";
    
    return {
        increment1: function() {
            var msg = Channel.lookup("cronTestOut").receive();
            Channel.lookup("cronTestIn").send(msg + 1);
        }
    };
});

