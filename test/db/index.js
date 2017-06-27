/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([], function() {

    return {
        main: function() {
            print("test: wilton.db ...");

            require([
                "wilton/test/db/DBConnectionTest"
            ], function() {});

            print("test: wilton.db passed");
        }
    };
});

