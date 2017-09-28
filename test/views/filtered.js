/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["assert"], function(assert) {
    "use strict";

    return {
        GET: function(req) {
            assert(true === req.filtered1);
            assert(true === req.filtered2);
            req.sendResponse("filtered OK");
        }
    };
});
