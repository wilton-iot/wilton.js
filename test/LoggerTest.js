/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "assert",
    "wilton/Logger",
    "wilton/utils"
], function(assert, Logger, utils) {
    "use strict";

    print("test: wilton/Logger");

    Logger.initialize({
        appenders: [{
                appenderType: "CONSOLE",
                thresholdLevel: "WARN" // lower me for debugging
            }],
        loggers: {
            "staticlib": "INFO",
            "wilton": "DEBUG",
            "wilton.test": "ERROR"
        }
    });

    var logger = new Logger("wilton.test");
    var checker = function(expected) {
        return function(err, actual) {
            assert.equal(actual, expected);
        };
    };
    logger.log("foo", checker("foo"));
    logger.debug(null, checker("null"));
    var e = new Error("ERR");
    logger.info(e, checker(utils.formatError(e)));
    var obj = {
        foo: "bar",
        baz: 42
    };
    logger.warn(obj, checker(JSON.stringify(obj)));
    var arr = ["foo", "bar"];
    logger.warn(arr, checker(JSON.stringify(arr)));
    var fun = function(a) { return a; };
    logger.log(fun, checker(String(fun)));

});
