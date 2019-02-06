
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
    "assert",
    "wilton/loader",
    "wilton/utils"
], function(module, assert, loader, utils) {
    "use strict";

    print("test: wilton/loader");

    // findModulePath
    assert(utils.endsWith(loader.findModulePath(module.id), "wilton/test/loaderTest"));
    assert(utils.endsWith(loader.findModulePath(module.id + ".js"), "wilton/test/loaderTest.js"));
    assert(utils.endsWith(loader.findModulePath(module.id + ".txt"), "wilton/test/loaderTest.txt"));

    // findModuleDirectory
    assert(utils.endsWith(loader.findModuleDirectory(module.id), "wilton/test/"));

    // loadModuleResource
    assert(loader.loadModuleResource("wilton/test/data/foo.txt").trim(), "foo");

    // loadModuleJson
    assert(loader.loadModuleJson("wilton/test/data/foo.json").foo, 42);
});
