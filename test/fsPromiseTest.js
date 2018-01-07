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

define(["assert", "wilton/fs", "wilton/utils"], function(assert, fs, utils) {
    "use strict";
    utils.promisifyAll(fs);

    print("test: wilton/fs (promise)");

    // listDirectory promise

    var called = false;
    fs.readdirPromise(".").then(function(li) {
        assert(li.length > 0);
        called = true;
    }).catch(function(err) {
        assert(false);
    });
    assert(true === called);
    
    called = false;
    fs.readdirPromise("FAIL").then(function(li) {
        assert(false);
    }).catch(function(err) {
        assert(!utils.undefinedOrNull(err));
        called = true;
    });
    assert(true === called);

});
