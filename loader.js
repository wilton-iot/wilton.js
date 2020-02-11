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
 * @namespace loader
 * 
 * __wilton/loader__ \n
 * Load resource files using logical module names.
 * 
 * This module allows to load resource files that are stored
 * inside the JavaScript source tree in file system directories
 * on inside ZIP files.
 * 
 * Additonally it contains `loadAppConfig()` function
 * that loads `config.json` file from its expected location inside `appdir/conf/` directory.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // full path to the "foo/bar" module, may point to file system or ZIP path
 * var path = loader.findModulePath("foo/bar");
 * 
 * // load text file from module "foo"
 * var text = loader.loadModuleResource("foo/baz.txt");
 * 
 * // load JSON file from module "foo", parse it and return it as an object
 * var obj = loader.loadModuleJson("foo/boo.json");
 * 
 * // load application config from `appdir/conf/` directory
 * var conf = loader.loadAppConfig();
 * 
 * @endcode
 * 
 */
define([
    "require",
    "./mustache",
    "./utils",
    "./wiltoncall"
], function(require, mustache, utils, wiltoncall) {
    "use strict";

    var fileProtocolPrefix = "file://";
    var zipProtocolPrefix = "zip://";

    /**
     * @function findModulePath
     * 
     * Find out the full path to the specified module
     * 
     * Returns the full path to the specified module. Returned path may
     * point either to file system or to ZIP path.
     * 
     * Note, that to get the path to module file in FS input module ID
     * must include the file extension, example: `module.id + ".js"`.
     * 
     * @param module `Object|String` either `module` object or module ID `String`
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` full path to the specified module
     */
    function findModulePath(module, callback) {
        try {
            var modname = "string" === typeof(module.id) ? module.id : module;
            var url = require.toUrl(modname);
            if (utils.startsWith(url, fileProtocolPrefix)) {
                url = url.substr(fileProtocolPrefix.length);
            } else if (utils.startsWith(url, zipProtocolPrefix)) {
                url = url.substr(zipProtocolPrefix.length);
            }
            return utils.callOrIgnore(callback, url);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function findModuleDirectory
     * 
     * Find out the full path to the specified module direcotory
     * 
     * Finds out directory where resides file of the specified module.
     * 
     * @param module `Object|String` either `module` object or module ID `String`
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `String` path to module directory
     * 
     */
    function findModuleDirectory(module, callback) {
        try {
            var modname = "string" === typeof(module.id) ? module.id : module;
            var path = findModulePath(modname, callback);
            var dir = path.replace(/\/[^\/]+(.js)?$/g, "/");
            return utils.callOrIgnore(callback, dir);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function loadModuleResource
     * 
     * Load resource file using logical module path.
     * 
     * Loads text resource file with the specified logical
     * module path from file system or from ZIP file.
     * 
     * @param modname `String` logical module path to the resource file
     * @param options `Object|Undefined` configuration object, can be omitted, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` contents of the specified file
     * 
     * __Options__
     *  - __hex__ `Boolean` whether data read from specified resources needs
     *                      to be converted to HEX format before returning it to caller;
     *                      `false` by default
     */
    function loadModuleResource(modname, options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var url = require.toUrl(modname);
            var res = wiltoncall("load_module_resource", {
                url: url,
                hex: true === opts.hex
            });
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function loadModuleJson
     * 
     * Load JSON file using logical module path.
     * 
     * Loads JSON file with the specified logical
     * module path from file system or from ZIP file.
     * 
     * Loaded JSON file is parsed and returned as an `Object`.
     * 
     * @param modname `String` logical module path to the JSON file
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` parsed contents of the specified JSON file
     */
    function loadModuleJson(modname, callback) {
        try {
            var str = loadModuleResource(modname);
            var res = JSON.parse(str);
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function loadAppConfig
     * 
     * Load `config.json` file from `appdir/conf/` directory.
     * 
     * This method expects that application is running using the "standard"
     * directory structure:
     * 
     * - `appdir`: application directory, can have arbitrary name
     *   - `bin`: (optional) contains executables and libraries
     *   - `conf`: contains `config.json`
     *   - `log`: contains log output files
     *   - `work`: contains temporary files
     *   - `index.js`: startup module
     *   
     * Loaded file contents are preprocessed replacing references to `{{{appdir}}}`
     * with an actual path to application directory.
     * 
     * @param startupModule `Object` RequireJS startup module
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Object` configuration object parsed from `config.json` file
     */
    function loadAppConfig(startupModule, callback) {
        try {
            if(!("object" === typeof(startupModule) && "string" === typeof(startupModule.id))) {
                throw new Error("Invalid startup module specified, value: [" + startupModule + "]");
            }
            var appdir = findModuleDirectory(startupModule.id);
            var confPath = appdir + "conf/config.json";
            var confStr = mustache.renderFile(confPath, {
                appdir: appdir
            });
            var res = JSON.parse(confStr);
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    return {
        fileProtocolPrefix: fileProtocolPrefix,
        zipProtocolPrefix: zipProtocolPrefix,
        findModulePath: findModulePath,
        findModuleDirectory: findModuleDirectory,
        loadModuleResource: loadModuleResource,
        loadModuleJson: loadModuleJson,
        loadAppConfig: loadAppConfig
    };
});

