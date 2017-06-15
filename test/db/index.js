/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["wilton/shared", "wilton/db/connManager"], function(shared, connManager) {

    return {
        main: function() {
            print("test: wilton.db ...");
            var config = {
                connManagerKey: "wilton.test.db.connManager",
                dbUrl: "sqlite://test.db"
//                dbUrl: "postgresql://host=127.0.0.1 port=5432 dbname=test user=test password=test"
            };
            shared.put("wilton.test.db.config", config);

            require([
                "wilton/test/db/ConnectionTest"
            ], function() {});

            connManager.shutdown({
                sharedKey: config.connManagerKey
            });
            print("test: wilton.db passed");
        }
    };
});

