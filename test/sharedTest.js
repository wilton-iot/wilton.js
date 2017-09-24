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

    print("test: wilton/shared");

    shared.put("foo", {
        bar: 42
    });
    
    var out1 = shared.get("foo");
    assert(!utils.undefinedOrNull(out1.bar));
    assert(42 === out1.bar);

    // see wait for change test in threadTest

    shared.remove("foo");
    shared.remove("bar");

});
