/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["./misc", "./mustache", "./utils", "./wiltoncall"], function(misc, mustache, utils, wiltoncall) {
   
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
    
    function loadAppConfig() {
        var values = {"appdir": conf.applicationDirectory};
        var confPath = conf.applicationDirectory + "conf/config.json";
        var confStr = mustache.renderFile(confPath, values);
        return JSON.parse(confStr);
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

