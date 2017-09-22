/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["assert", "wilton/fs", "wilton/utils"], function(assert, fs, utils) {
    "use strict";
    utils.promisifyAll(fs);

    print("test: wilton/fs (promise)");

    // listDirectory promise

    var called = false;
    fs.readdirPromise(".").then(function(li) {
        assert(li.length > 0);
        called = true;
    }).catch(function(err) {
        assert(false);
    });
    assert(true === called);
    
    called = false;
    fs.readdirPromise("FAIL").then(function(li) {
        assert(false);
    }).catch(function(err) {
        assert(!utils.undefinedOrNull(err));
        called = true;
    });
    assert(true === called);

});
