/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["wilton/shared", "wilton/clientManager"], function(shared, clientManager) {

    return {
        main: function() {
            print("test: wilton.core ...");
            var config = {
                clientManagerKey: "wilton.test.core.clientManager",
            };
            shared.put("wilton.test.core.config", config);

            require([
                "wilton/test/core/LoggerTest",
                "wilton/test/core/CronTaskTest",
                "wilton/test/core/HttpClientTest",
                "wilton/test/core/ServerTest",
                "wilton/test/core/miscTest",
                "wilton/test/core/mustacheTest",
                "wilton/test/core/threadTest",
                "wilton/test/core/sharedTest",
                "wilton/test/core/fsTest",
                "wilton/test/core/fsPromiseTest",
                "wilton/test/core/utilsTest"
            ], function() {});

            clientManager.shutdown({
                sharedKey: config.clientManagerKey
            });
            print("test: wilton.core passed");
        }
    };
});

