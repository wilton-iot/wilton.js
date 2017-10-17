
define([
    "assert",
    "wilton/fs",
    "wilton/loader",
    "wilton/process"
], function(assert, fs, loader, process) {
    "use strict";

    print("test: wilton/process");

    var executable = loader.findModulePath("") + "/../build/bin/wilton_cli";
    if (!fs.exists(executable)) {
        executable += ".exe";
    }
    
    var pid = process.spawn({
        executable: executable, 
        args: ["-h"], 
        outputFile: "miscTest_out.txt",
        awaitExit: false
    });
    assert(pid > 0);
    
});
