/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./utils"], function(wiltoncall, utils) {
    "use strict";

    function dyload(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            wiltoncall("dyload_shared_library", opts);
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return dyload;
});
