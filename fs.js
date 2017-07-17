/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./misc", "./utils"], function(wiltoncall, misc, utils) {
    "use strict";

    var modulesPath = function() {
        var obj = misc.getWiltonConfig();
        if (!("object" === typeof(obj.requireJsConfig) && "string" === typeof (obj.requireJsConfig.baseUrl))) {
            throw new Error("Invalid incomplete wiltoncall config: [" + JSON.stringify(obj) + "]");
        }
        var path = obj.requireJsConfig.baseUrl;
        if (utils.endsWith(path, ".zip")) {
            path += "/";
        }
        return path;
    }();

    function listDirectory(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var res = wiltoncall("fs_list_directory", opts);
            var list = JSON.parse(res);
            utils.callOrIgnore(callback, list);
            return list;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function readFile(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var res = wiltoncall("fs_read_file", opts);
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function writeFile(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            wiltoncall("fs_write_file", opts);
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    return {
        listDirectory: listDirectory,
        readFile: readFile,
        writeFile: writeFile
    };
});
