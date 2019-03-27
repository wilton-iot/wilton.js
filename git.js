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

/**
 * @namespace git
 * 
 * __wilton/git__ \n
 * Work with Git repositories
 * 
 * This module allows to work with remote and local Git repositories.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // clone local repo
 * git.clone("file://path/to/my/repo", "path/to/dest");
 * 
 * // clone over SSH
 * git.clone("git+ssh://androiddev@127.0.0.1/home/androiddev/app", repo, {
 *         sshPublicKeyPath: "/home/alex/.ssh/id_rsa.pub",
 *         sshPrivateKeyPath: "/home/alex/.ssh/id_rsa"
 *     });
 * 
 * // clone over HTTPS
 * git.clone("https://bitbucket.org/orgid/repo.git", "path/to/dest", {
 *         httpsUser: "myuser",
 *         httpsPassword: "mypwd"
 *     });
 * 
 * @endcode
 */

define([
    "./dyload",
    "./utils",
    "./wiltoncall"
], function(dyload, utils, wiltoncall) {
    "use strict";

    dyload({
        name: "wilton_git"
    });

    /**
     * @function clone
     * 
     * Clone remote Git repository
     * 
     * Clones repote Git repository to the specified path, supports `Local`,
     * `SSH` and `HTTPS(S)` transport protocols.
     * 
     * For SSH authentication username must be specified as a part of the URL, example:
     * `git+ssh://myuser@127.0.0.1/path/to/my/app`
     * 
     * For Git authentication over HTTPS username may be spacified either in URL or as a `httpsUser` option;
     * if both variants are used at the same time - `httpUser` takes preference.
     * 
     * @param url `String` URL of the remote Git repository, must have one of the supported protocol 
     *              prfixes: `file://`, `git+ssh://`, `http://`, `https://`
     * @param repo `String` path to the destination local repository
     * @param options `Object|Undefined` configuration object, can be omitted, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     * 
     * __Options__
     *  - __sshPublicKeyPath__ `String|Undefined` path to the public SSH key file that should be
     *                          used for authentication with the SSH server
     *  - __sshPrivateKeyPath__ `String|Undefined` path to the private SSH key file that should be
     *                          used for authentication with the SSH server
     *  - __httpsCheckCertificate__ `Boolean|Undefined` whether HTTPS certificate of the Git server
     *                          should be checked for validness, default value: `true`
     *  - __httpsUser__ `String|Undefined` user name that should be used for Git authentication over HTTPS
     *  - __httpsPassword__ `String|Undefined` password that should be used for Git authentication over HTTPS
     */
    function clone(url, repo, options, callback) {
        if ("undefined" === typeof(callback)) {
            callback = options;
        }
        try {
            wiltoncall("git_clone", {
                url: url,
                repo: repo,
                options: utils.defaultObject(options)
            });
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    function pull(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            wiltoncall("git_pull", opts);
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return {
        clone: clone,
        pull: pull
    };
});