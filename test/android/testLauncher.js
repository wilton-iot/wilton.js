/*
 * Copyright 2019, alex at staticlibs.net
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
    "module",
    "wilton/android/runOnRhino",
    "wilton/fs",
    "wilton/Logger",
    "wilton/loader",
    "wilton/misc",
    "wilton/Server",
    "wilton/utils"
], function(module, runOnRhino, fs, Logger, loader, misc, Server, utils) {
    "use strict";
    var logger = new Logger(module.id);
    utils.checkRootModuleName(module, "wilton");

    function showMessage(msg) {
        runOnRhino({
            module: "apps/wilton/test/android/rhinoShowMessage",
            args: [msg]
        });
    }

    return {
        main: function() {
            var conf = loader.loadAppConfig({
                id: "wilton/test"
            });
            // create necessary dirs
            fs.mkdir(conf.appdir + "log", function() {});
            fs.mkdir(conf.appdir + "work", function() {});

            // init logging
            Logger.initialize(conf.logging);

            // start server
            var server = new Server({
                tcpPort: 8888,
                views: [
                    "wilton/test/android/view"
                ],
                rootRedirectLocation: "/wilton/test/android/view"
            });

            var runner = null;
            require(["wilton/test/index"], function(index) {
                runner = index.main;
            });

            try {
                runner();
                var smsg = "Tests finished successfully!";
                showMessage(smsg);
                logger.info(smsg);
            } catch (e) {
                logger.error(e);
                var msg = utils.formatError(e);
                showMessage(msg);
            }

            // wait for shutdown
            misc.waitForSignal();

            logger.info("Shutting down ...");
            server.stop();
        }
    };
});
