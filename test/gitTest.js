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
    var repo = dir + "repo";

    var modpath = loader.findModuleDirectory("wilton/git");

    var url = "";
    var jsBundleUsed = fs.isDirectory(modpath + "../.git");
    if (jsBundleUsed) {
        url = "file://" + modpath + "../../core/";
    } else {
        url = "file://" + modpath;
    }

    // clone

    // no protocol prefix
    assert.throws(function() {
        git.clone(modpath, repo);
    });

    git.clone(url, repo);

    // pull

    git.pull(repo, "master");

/*
    git.clone("git+ssh://androiddev@127.0.0.1/home/androiddev/app", repo, {
            sshPublicKeyPath: "/home/alex/.ssh/id_rsa.pub",
            sshPrivateKeyPath: "/home/alex/.ssh/id_rsa"
        });
*/

/*
    git.clone("https://", repo, {
            httpsUser: "",
            httpsPassword: ""
        });
*/

    // cleanup
    fs.rmdir(dir);

});

