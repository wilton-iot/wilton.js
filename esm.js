/*
 * Copyright 2020, alex at staticlibs.net
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

/**
 * @namespace esm
 * 
 * __wilton/esm__ \n
 * Export Wilton API as a ES module.
 * 
 * This module allows client code to import Wilton as a ES module.
 * 
 * All Wilton API is exported as a single `wilton` variable, that
 * must be imported first and then can be desctructured to access separate "submodules".
 * These submodules (and their corresponding native libraries) are loaded lazily.
 * 
 * When ES modules are used as `callbackScript`s to be invoked 
 * (possibly in another thread) from native code, they must be specified
 * using full path (including protocol prefix) to JS file in `esmodule` attribute.
 * Arguments can be provided to such `callbackScript`s using `args` attribute,
 * but only `String`, `Integer` and `Boolean` arguments are supported.
 * Arguments can be accessed from ES module using `import.meta.args`.
 * `func` attribute is not supported for ES modules.
 * 
 * Usage example:
 * 
 * @code
 * 
 * import wilton from "wilton";
 * const { Channel, thread } = wilton;
 * 
 * var chan = new Channel("...");
 * 
 * // run foo.js in another thread
 * 
 * var threadExitChan = thread.run({
 *     callbackScript: {
 *         esmodule: `${import.meta.dir}/foo.js`
 *     }
 * });
 * 
 * @endcode
 */

import { require } from "wilton-requirejs";

// lazy loading corresponding native libs
const wilton = {
    get Channel() { return require("wilton/Channel"); },
    get CronTask() { return require("wilton/CronTask"); },
    get DBConnection() { return require("wilton/DBConnection"); },
    get DelayedResponse() { return require("wilton/DelayedResponse"); },
    get DelayedWebSocket() { return require("wilton/DelayedWebSocket"); },
    get KVStore() { return require("wilton/KVStore"); },
    get Logger() { return require("wilton/Logger"); },
    get PDFDocument() { return require("wilton/PDFDocument"); },
    get PGConnection() { return require("wilton/PGConnection"); },
    get Request() { return require("wilton/Request"); },
    get Serial() { return require("wilton/Serial"); },
    get Server() { return require("wilton/Server"); },
    get Socket() { return require("wilton/Socket"); },
    get backendcall() { return require("wilton/backendcall"); },
    get crypto() { return require("wilton/crypto"); },
    get dyload() { return require("wilton/dyload"); },
    get fs() { return require("wilton/fs"); },
    get git() { return require("wilton/git"); },
    get hex() { return require("wilton/hex"); },
    get httpClient() { return require("wilton/httpClient"); },
    get kiosk() { return require("wilton/kiosk"); },
    get loader() { return require("wilton/loader"); },
    get misc() { return require("wilton/misc"); },
    get mustache() { return require("wilton/mustache"); },
    get net() { return require("wilton/net"); },
    get process() { return require("wilton/process"); },
    get service() { return require("wilton/service"); },
    get thread() { return require("wilton/thread"); },
    get utils() { return require("wilton/utils"); },
    get wiltoncall() { return require("wilton/wiltoncall"); },
    get zip() { return require("wilton/zip"); }
};

export default wilton;