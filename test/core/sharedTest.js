/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "assert",
    "wilton/shared", 
    "wilton/utils"
], function(assert, shared, utils) {
    "use strict";

    shared.put("foo", {
        bar: 42
    });
    
    var out1 = shared.get("foo");
    assert(!utils.undefinedOrNull(out1.bar));
    assert(42 === out1.bar);

    shared.listAppend("bar", 41);
    shared.listAppend("bar", 42);
    
    var bar = shared.get("bar");
    assert(2 === bar.length);
    assert(41 === bar[0]);
    assert(42 === bar[1]);

    // see wait for change test in threadTest

    shared.remove("foo");
    shared.remove("bar");

});
