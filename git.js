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
 * // TODO
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

    function clone(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            wiltoncall("git_clone", opts);
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