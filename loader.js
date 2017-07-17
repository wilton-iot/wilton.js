/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["./misc", "./utils", "./wiltoncall"], function(misc, utils, wiltoncall) {
   
    var conf = misc.getWiltonConfig();
   
    function _findModuleUrl(modname, callback) {
        try {
            if ("string" !== typeof(modname)) {
                throw new Error("Invalid non-string module name specified, modname: [" + modname + "]");
            }
            var res = null;
            var paths = conf.requireJsConfig.paths;
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
                res = conf.requireJsConfig.baseUrl + "/" + modname;
            }
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function findModulePath(modname, callback) {
        try {
            var url = _findModuleUrl(modname);
            if (url.length > 7) {
                var res = url.substr(7);
                utils.callOrIgnore(callback, res);
                return res;
            }
            throw new Error("Error finding module path," +
                    " modname: [" + modname + "], url: [" + url + "]");
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
    
    return {
        findModulePath: findModulePath,
        loadModuleResource: loadModuleResource,
        loadModuleJson: loadModuleJson
    };
});

