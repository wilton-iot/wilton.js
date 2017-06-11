/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["wilton/fs", "wilton/utils", "./_testUtils"], function(fs, utils, testUtils) {
    "use strict";

    var assert = testUtils.assert;
    utils.promisifyAll(fs);

    // listDirectory promise

    var called = false;
    fs.listDirectoryPromise({
        path: "."
    }).then(function(li) {
        assert(li.length > 0);
        called = true;
    }).catch(function(err) {
        assert(false);
    });
    assert(true === called);
    
    called = false;
    fs.listDirectoryPromise({
        path: "FAIL"
    }).then(function(li) {
        assert(false);
    }).catch(function(err) {
        assert(!utils.undefinedOrNull(err));
        called = true;
    });
    assert(true === called);

});
