/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./utils"], function(wiltoncall, utils) {
    "use strict";

    function listDirectory(options) {
        var opts = utils.defaultObject(options);
        var onSuccess = opts.onSuccess;
        var onFailure = opts.onFailure;
        delete opts.onSuccess;
        delete opts.onFailure;
        try {
            var res = wiltoncall("fs_list_directory", opts);
            var list = JSON.parse(res);
            utils.callOrIgnore(onSuccess, list);
            return list;
        } catch (e) {
            utils.callOrThrow(onFailure, e);
        }
    }
    
    function readFile(options) {
        var opts = utils.defaultObject(options);
        var onSuccess = opts.onSuccess;
        var onFailure = opts.onFailure;
        delete opts.onSuccess;
        delete opts.onFailure;
        try {
            var res = wiltoncall("fs_read_file", opts);
            utils.callOrIgnore(onSuccess, res);
            return res;
        } catch (e) {
            utils.callOrThrow(onFailure, e);
        }
    }
    
    function writeFile(options) {
        var opts = utils.defaultObject(options);
        var onSuccess = opts.onSuccess;
        var onFailure = opts.onFailure;
        delete opts.onSuccess;
        delete opts.onFailure;
        try {
            wiltoncall("fs_write_file", opts);
            utils.callOrIgnore(onSuccess);
        } catch (e) {
            utils.callOrThrow(onFailure, e);
        }
    }

    return {
        listDirectory: listDirectory,
        readFile: readFile,
        writeFile: writeFile
    };
});
