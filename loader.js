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
    "./misc",
    "./mustache",
    "./utils",
    "./wiltoncall"
], function(misc, mustache, utils, wiltoncall) {
   
    var conf = misc.wiltonConfig();
    
    var fileProtocolPrefix = "file://";
    var zipProtocolPrefix = "zip://";
   
    function _findModuleUrl(modname, callback) {
        try {
            if ("string" !== typeof(modname)) {
                throw new Error("Invalid non-string module name specified, modname: [" + modname + "]");
            }
            var res = null;
            var paths = conf.requireJs.paths;
            if ("object" === typeof (paths)) {
                for (var mod in paths) {
                    if (paths.hasOwnProperty(mod)) {
                        var modshort = mod;
                        if (utils.endsWith(mod, "/")) {
                            modshort = mod.substring(0, mod.length - 2);
                        }
                        if (utils.startsWith(modname, modshort)) {
                            var modpath = paths[mod];
                            if (modname.length > mod.length) {
                                var tail = modname.substr(mod.lenght);
                                modpath = modpath + tail;
                            }
                            res = modpath;
                            break;
                        }
                    }
                }
            }
            if (null === res) {
                res = conf.requireJs.baseUrl + "/" + modname;
            }
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    /**
     * @function findModulePath
     * 
     * Find the full path to the specified module.
     * 
     * Returns the full path to the specified module. Returned path may
     * point either to file system or to ZIP path.
     * 
     * @param modname `String` 
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` full path to the specified module
     */
    function findModulePath(modname, callback) {
        try {
            var url = _findModuleUrl(modname);
            if (utils.startsWith(url, fileProtocolPrefix)) {
                url = url.substr(fileProtocolPrefix.length);
            } else if (utils.startsWith(url, zipProtocolPrefix)) {
                url = url.substr(zipProtocolPrefix.length);
            }
            utils.callOrIgnore(callback, url);
            return url;
        } catch (e) {
            utils.callOrThrow(callback, e);
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
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String` contents of the specified file
     */
    function loadModuleResource(modname, callback) {
        try {
            var url = _findModuleUrl(modname);
            var res = wiltoncall("load_module_resource", url);
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
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
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
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
     *   - `bin`: contains executables and libraries
     *   - `conf`: contains `config.json`
     *   - `log`: contains log output files
     *   - `work`: contains temporary files
     *   
     * Loaded file contents are preprocessed replacing references to `{{{appdir}}}`
     * with an actual path to application directory.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Object` configuration object parsed from `config.json` file
     */
    function loadAppConfig(callback) {
        try {
            var values = {"appdir": conf.applicationDirectory};
            var confPath = conf.applicationDirectory + "conf/config.json";
            var confStr = mustache.renderFile(confPath, values);
            var res = JSON.parse(confStr);
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    return {
        fileProtocolPrefix: fileProtocolPrefix,
        zipProtocolPrefix: zipProtocolPrefix,
        findModulePath: findModulePath,
        loadModuleResource: loadModuleResource,
        loadModuleJson: loadModuleJson,
        loadAppConfig: loadAppConfig
    };
});

