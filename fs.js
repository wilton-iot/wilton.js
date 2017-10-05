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
 * @namespace fs
 * 
 * __wilton/fs__ \n
 * File I/O and file-system operations.
 * 
 * This module implements a synchronous-only subset of
 * [fs module from Node.js](https://nodejs.org/api/fs.html).
 * 
 * It provides wrappers around standard posix functions.
 * 
 */
define([
    "./dyload",
    "./utils",
    "./wiltoncall"
], function(dyload, utils, wiltoncall) {
    "use strict";

    dyload({
        name: "wilton_fs"
    });

    /**
     * @function appendFile
     * 
     * Append data to a file, creating the file if it does not yet exist.
     * 
     * Appends data to a file, creating the file if it does not yet exist.
     * 
     * @param path `String` path to file
     * @param data `String` data to append
     * @param options `Undefined` placeholder parameter, added for compatibility with Node API
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     */
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
    
    /**
     * @function exists
     * 
     * Test whether or not the given path exists by checking with the file system.
     * 
     * Tests whether or not the given path exists by checking with the file system.
     * 
     * @param path `String` path to file or directory
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Boolean` `true` if specified path exists, false otherwise
     */
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
    
    /**
     * @function mkdir
     * 
     * Create a directory.
     * 
     * Creates a directory.
     * 
     * @param path `String` path to directory
     * @param mode `Undefined` placeholder parameter, added for compatibility with Node API
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     */
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
 
    /**
     * @function readdir
     * 
     * List the contents of a directory.
     * 
     * Lists the contents of a directory.
     * 
     * @param path `String` path to directory
     * @param options `Undefined` placeholder parameter, added for compatibility with Node API
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Array` list of files and directories inside the specified directory
     */
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

    /**
     * @function readFile
     * 
     * Read the entire contents of a file.
     * 
     * Reads the entire contents of a file.
     * 
     * @param path `String`
     * @param options `Undefined` placeholder parameter, added for compatibility with Node API
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `String` file contents
     */
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
 
    /**
     * @function rename
     * 
     * Rename (move) file or directory.
     * 
     * Renames (moves) file or directory.
     * 
     * @param oldPath `String` existing path
     * @param newPath `String` desired path
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     */
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

    /**
     * @function rmdir
     * 
     * Delete directory.
     * 
     * Deletes directory that must be empty.
     * 
     * @param path `String` path to directory
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     */
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
    
    /**
     * @function stat
     * 
     * Read file or directory status.
     * 
     * Reads file or directory status.
     * 
     * @param path `String`
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Object` with the following fields:
     * 
     *  - __size__ `Number` file size in bytes, `0` for directory
     *  - __isFile__ `Boolean` whether it is a file
     *  - __isDirectory__ `Boolean` whether it is a directory
     */
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

    /**
     * @function unlink
     * 
     * Delete file.
     * 
     * Deletes file.
     * 
     * @param path `String` path to file
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     */
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
    
    /**
     * @function writeFile
     * 
     * Write specified data to a file, overwriting a file if it exists.
     * 
     * Writess pecified data to a file, overwriting a file if it exists.
     * 
     * @param path `String` path to file
     * @param data `String` data to write
     * @param options `Undefined` placeholder parameter, added for compatibility with Node API
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     */
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
    
    /**
     * @function copyFile
     * 
     * Copy a file.
     * 
     * Copies specified file.
     * 
     * @param oldPath `String` existing path
     * @param newPath `String` desired path
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     */
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
