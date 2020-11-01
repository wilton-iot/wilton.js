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
    "wilton/misc",
    "wilton/process",
    "./_scratchDir"
], function(assert, fs, misc, process, scratchDir) {
    "use strict";

    print("test: wilton/process");

    if (misc.isAndroid()) {
        return;
    }

    var executable = misc.wiltonConfig().wiltonHome + "bin/wilton";
    if (misc.isWindows()) { 
        executable += ".exe";
    }

    // spawn

    var pid = process.spawn({
        executable: executable, 
        args: ["-h"], 
        directory: scratchDir,
        awaitExit: false
    });
    assert(pid > 0);

    // kill
    var err = process.killByPid(pid);
    assert.equal(err, "");

    // current pid
    var cpid = process.currentPid();
    assert(cpid > 0);
});
