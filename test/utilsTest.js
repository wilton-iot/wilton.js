/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["wilton/utils", "./_testUtils"], function(utils, testUtils) {
    "use strict";

    testUtils.assert(utils.undefinedOrNull(null));
    testUtils.assert(!utils.undefinedOrNull(testUtils));

    testUtils.assert(utils.startsWith("foo", "fo"));
    testUtils.assert(!utils.startsWith("foo", "ba"));

    testUtils.assert(utils.endsWith("foo", "oo"));
    testUtils.assert(!utils.endsWith("foo", "ar"));

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
