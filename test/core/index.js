/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["wilton/shared", "wilton/HttpClient"], function(shared, HttpClient) {

    return {
        main: function() {
            print("test: wilton.core ...");
            var config = {
                httpClientKey: "wilton.test.core.httpClient"
            };
            shared.put("wilton.test.core.config", config);

            var httpClient = new HttpClient();
            shared.put(config.httpClientKey, {
                handle: httpClient.handle
            });

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
            ], function() {
            });

            httpClient.close();
            print("test: wilton.core passed");
        }
    };
});

