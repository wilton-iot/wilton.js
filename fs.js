/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "./dyload",
    "./wiltoncall",
    "./utils"
], function(dyload, wiltoncall, utils) {
    "use strict";

    dyload({
        name: "wilton_fs"
    });

    function appendFile(path, data, options, callback) {
        if ("undefined" === typeof(callback)) {
            callback = options;
        }
        try {
            wiltoncall("fs_append_file", {
                path: path,
                data: data
            });
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function exists(path, callback) {
        try {
            var resstr = wiltoncall("fs_exists", {
                path: path
            });
            var res = JSON.parse(resstr).exists;
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function mkdir(path, mode, callback) {
        if ("undefined" === typeof (callback)) {
            callback = mode;
        }
        try {
            wiltoncall("fs_mkdir", {
                path: path
            });
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
       
    function readdir(path, options, callback) {
        if ("undefined" === typeof (callback)) {
            callback = options;
        }
        try {
            var res = wiltoncall("fs_readdir", {
                path: path
            });
            var list = JSON.parse(res);
            utils.callOrIgnore(callback, list);
            return list;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function readFile(path, options, callback) {
        if ("undefined" === typeof (callback)) {
            callback = options;
        }
        try {
            var res = wiltoncall("fs_read_file", {
                path: path
            });
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
            
    function rename(oldPath, newPath, callback) {
        try {
            wiltoncall("fs_rename", {
                oldPath: oldPath,
                newPath: newPath
            });
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function rmdir(path, callback) {
        try {
            wiltoncall("fs_rmdir", {
                path: path
            });
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function stat(path, callback) {
        try {
            var resstr = wiltoncall("fs_stat", {
                path: path
            });
            var res = JSON.parse(resstr);
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function unlink(path, callback) {
        try {
            wiltoncall("fs_unlink", {
                path: path
            });
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function writeFile(path, data, options, callback) {
        if ("undefined" === typeof (callback)) {
            callback = options;
        }
        try {
            wiltoncall("fs_write_file", {
                path: path,
                data: data
            });
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    function copyFile(oldPath, newPath, callback) {
        try {
            wiltoncall("fs_copy_file", {
                oldPath: oldPath,
                newPath: newPath
            });
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    return {
        appendFile: appendFile,
        appendFileSync: appendFile,
        exists: exists,
        existsSync: exists,
        mkdir: mkdir,
        mkdirSync: mkdir,
        readdir: readdir,
        readdirSync: readdir,
        readFile: readFile,
        readFileSync: readFile,
        rename: rename,
        renameSync: rename,
        rmdir: rmdir,
        rmdirSync: rmdir,
        stat: stat,
        statSync: stat,
        unlink: unlink,
        unlinkSync: unlink,
        writeFile: writeFile,
        writeFileSync: writeFile,
        copyFile: copyFile,
        copyFileSync: copyFile
    };
});
