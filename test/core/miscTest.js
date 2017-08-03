/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "assert",
    "wilton/fs",
    "wilton/loader",
    "wilton/misc",
    "wilton/Server"
], function(assert, fs, loader, misc, Server) {
    "use strict";

    var server = new Server({
        tcpPort: 8080,
        views: [
            "wilton/test/core/views/hi"
        ]
    });

    misc.tcpWaitForConnection({
        ipAddress: "127.0.0.1",
        tcpPort: 8080,
        timeoutMillis: 100
    });

    server.stop();
    
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
