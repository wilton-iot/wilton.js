/*
 * Copyright 2017, alex at staticlibs.net
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
