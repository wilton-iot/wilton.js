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

/**
 * @namespace mustache
 * 
 * __wilton/mustache__ \n
 * Render [mustache](https://mustache.github.io/) templates.
 * 
 * This module allows to render [mustache](https://mustache.github.io/) templates from in-memory strings
 * or directly from files.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // render string template
 * var rendered = mustache.render("{{#names}}Hi {{name}}!\n{{/names}}", {
 *     names: [
 *         {name: "Chris"},
 *         {name: "Mark"},
 *         {name: "Scott"}
 *     ]
 * });
 * // rendered == "Hi Chris!\nHi Mark!\nHi Scott!\n"
 * 
 * // render template from file
 * var resp = mustache.renderFile("path/to/my.mustache", {
 *     foo: "bar",
 *     baz: 42
 * });
 * 
 * @endcode
 * 
 */
define([
    "./dyload",
    "./utils",
    "./wiltoncall"
], function(dyload, utils, wiltoncall) {
    "use strict";

    dyload({
        name: "wilton_server"
    });

    /**
     * @function render
     * 
     * Render template specified as a string.
     * 
     * Renders template specified as a string.
     * 
     * @param template `String` template body
     * @param values `Object|Undefined` template parameters to use
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `String` rendered template
     */
    function render(template, values, callback) {
        try {
            var tp = utils.defaultString(template);
            var vals = utils.defaultObject(values);
            var res = wiltoncall("mustache_render", {
                template: tp,
                values: vals
            });
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e, "");
        }
    };

    /**
     * @function renderFile
     * 
     * Render template specified as a path to file.
     * 
     * Renders template specified as a path to file.
     * 
     * @param templateFile `String` path to template file
     * @param values `Object|Undefined` template parameters to use
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `String` rendered template
     */
    function renderFile(templateFile, values, callback) {
        try {
            var tpf = utils.defaultString(templateFile);
            var vals = utils.defaultObject(values);
            var res = wiltoncall("mustache_render_file", {
                file: tpf,
                values: vals
            });
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e, "");
        }
    };

    return {
        render: render,
        renderFile: renderFile
    };
});
