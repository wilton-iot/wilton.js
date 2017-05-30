/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["wilton/fs", "./_testUtils"], function(fs, testUtils) {
    "use strict";

    var li = fs.listDirectory({
        path: "."
    });
//    print(li);
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
