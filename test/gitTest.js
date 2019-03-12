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
    "assert",
    "wilton/fs",
    "wilton/git",
    "wilton/loader",
    "wilton/misc"
], function(assert, fs, git, loader, misc) {
    "use strict";

    print("test: wilton/git");
    
    var appdir = misc.wiltonConfig().applicationDirectory;

    // prepare sratch dir
    var dir = appdir + "gittest/";
    if (fs.exists(dir)) {
        fs.rmdir(dir);
    }
    fs.mkdir(dir);

    var url = loader.findModuleDirectory("wilton/git");
    var repo = dir + "repo";

    git.clone({
        url: url,
        repo: repo
    });

    git.pull({
        repo: repo,
        branch: "wilton"
    });

    fs.rmdir(dir);
});

