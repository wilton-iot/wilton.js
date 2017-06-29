/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["wilton/Logger"], function(Logger) {
    "use strict";

    Logger.initialize({
        appenders: [{
                appenderType: "CONSOLE",
                thresholdLevel: "WARN" // lower me for debugging
            }],
        loggers: [{
                name: "staticlib.pion",
                level: "INFO"
            }, {
                name: "wilton",
                level: "DEBUG"
            }]
    });

});
