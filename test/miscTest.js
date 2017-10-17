/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "assert",
    "wilton/fs",
    "wilton/loader",
    "wilton/misc"
], function(assert, fs, loader, misc) {
    "use strict";

    print("test: wilton/misc");

    var executable = loader.findModulePath("") + "/../build/bin/wilton_cli";
    if (!fs.exists(executable)) {
        executable += ".exe";
    }
    
    var pid = misc.spawnProcess({
        executable: executable, 
        args: ["-h"], 
        outputFile: "miscTest_out.txt",
        awaitExit: false
    });
    assert(pid > 0);
    
});
