/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([], function() {

    return {
        main: function() {
            print("test: wilton.core ...");
            
            require([
                "wilton/test/core/LoggerTest",
                "wilton/test/core/CronTaskTest",
                "wilton/test/core/httpClientTest",
                "wilton/test/core/ServerTest",
                "wilton/test/core/miscTest",
                "wilton/test/core/mustacheTest",
                "wilton/test/core/threadTest",
                "wilton/test/core/sharedTest",
                "wilton/test/core/fsTest",
                "wilton/test/core/fsPromiseTest",
                "wilton/test/core/utilsTest"
            ], function() {});

            print("test: wilton.core passed");
        }
    };
});

