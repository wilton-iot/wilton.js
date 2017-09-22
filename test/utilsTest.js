/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["assert", "wilton/utils"], function(assert, utils) {
    "use strict";

    print("test: wilton/utils");

    assert(utils.undefinedOrNull(null));
    assert(!utils.undefinedOrNull(utils));

    assert(utils.startsWith("foo", "fo"));
    assert(!utils.startsWith("foo", "ba"));

    assert(utils.endsWith("foo", "oo"));
    assert(!utils.endsWith("foo", "ar"));

    // todo
    
//    defaultObject
//    defaultString
//    defaultJson
//    callOrThrow
//    callOrIgnore
//    listProperties
//    checkProperties
//    checkPropertyType
});
