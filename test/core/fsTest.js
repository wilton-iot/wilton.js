/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["assert", "wilton/fs", "wilton/utils"], function(assert, fs, utils) {
    "use strict";

    // listDirectory

    var li = fs.listDirectory({
        path: "."
    });
    assert(li.length > 0);        
    
    var called = false;
    fs.listDirectory({
        path: "FAIL"
    }, function(err, li) {
        assert(!utils.undefinedOrNull(err));
        assert("undefined" === typeof(li));
        called = true;
    });
    assert(true === called);
    
    called = false;
    fs.listDirectory({
        path: "."
    }, function(err, li) {
        assert(null === err);
        assert(li.length > 0);
        called = true;
    });
    assert(true === called);        
    
    // readFile, see httpClientTest
    
//    testUtils.assert(li.length > 0);
//    var contents = fs.readFile({
//        path: "../test/wilton_test.c"
//    });
////    print(contents);
//    fs.writeFile({
//        path: "fsTest.tmp",
//        contents: contents
//    });

});
