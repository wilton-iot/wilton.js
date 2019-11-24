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
    "wilton/fs",
    "wilton/misc"
], function(assert, fs, misc) {
    "use strict";

    print("test: wilton/misc");

    assert("object" === typeof(misc.wiltonConfig()));

    // GC call present
    misc.runGC();

    // compile-time OS
    assert(misc.isAndroid() || misc.isWindows() || misc.isLinux() || misc.isMac());

    // systemdNotify
    if (misc.isLinux() && fs.exists("/usr/bin/systemctl")) {
        misc.systemdNotify("FOO", function(e) {
            assert(null !== e);
            var expected = "Error notifying systemd, message: [FOO], error code: [";
            assert(e.message.indexOf(expected) >= 0);
        });
    }

    // winscmStartDispatcher
    if (misc.isWindows()) {
        misc.winscmStartDispatcher("foo", function(e) {
            assert(null !== e);
            var expected = "Error starting service, name: [foo], error: [code: [1063], message: [";
            assert(e.message.indexOf(expected) >= 0);
        });
    }
});
