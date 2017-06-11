/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["wilton/fs", "wilton/utils", "./_testUtils"], function(fs, utils, testUtils) {
    "use strict";
    var assert = testUtils.assert;

    // listDirectory

    var li = fs.listDirectory({
        path: "."
    });
    assert(li.length > 0);        
    
    var called = false;
    fs.listDirectory({
        path: "FAIL"
    }, function(err, li) {
        assert(err.stack.length > 0);
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
    
    // readFile
    
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
