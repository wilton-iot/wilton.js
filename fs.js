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
 * Every function in this module has an alias with a `Sync` postfix
 * (to match Node.js convention), example: `readFile()` is the same as `readFileSync`.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // make directory
 * fs.mkdir("fstest");
 * 
 * // write data to file
 * fs.writeFile("fstest/test.txt", "foo");
 * fs.appendFile("fstest/test.txt", "bar");
 * 
 * // read file
 * fs.readFile("fstest/test.txt"); // "foobar"
 * 
 * // get file status
 * var props = fs.stat("fstest/test.txt");
 * 
 * @endcode
 */
define([
    "utf8",
    "./dyload",
    "./hex",
    "./utils",
    "./wiltoncall"
], function(utf8, dyload, hex, utils, wiltoncall) {
    "use strict";

    dyload({
        name: "wilton_fs"
    });

    function extractHexOption(options) {
        if ("object" === typeof(options) && null !== options) {
            if ("undefined" !== typeof(options.hex)) {
                if ("boolean" !== typeof(options.hex)) {
                    throw new Error("Invalid 'options' object," +
                            " properties: [" + JSON.stringify(utils.listProperties(options)) + "]");
                }
                return options.hex;
            }
        }
        return false;
    }

    function extractDelimiterOption(options) {
        if ("object" === typeof(options) && null !== options) {
            if ("undefined" !== typeof(options.delimiter)) {
                if ("string" !== typeof(options.delimiter)) {
                    throw new Error("Invalid 'options' object," +
                            " properties: [" + JSON.stringify(utils.listProperties(options)) + "]");
                }
                return options.hex;
            }
        }
        return "\n";
    }

    function writeOrAppend(path, data, opts, callback) {
        try {
            var entries = data instanceof Array ? data : [data];
            var delim = "string" === typeof(opts.delimiter) ? opts.delimiter : "";
            if (opts.hex) {
                delim = hex.encodeUTF8(delim);
            }
            // use thread-local writer
            try {
                wiltoncall("fs_open_tl_file_writer", {
                    path: path,
                    append: opts.append,
                    hex: opts.hex 
                });
                for (var i = 0; i < entries.length; i++) {
                    wiltoncall("fs_append_tl_file_writer", entries[i]);
                    if (i < entries.length - 1 && delim.length > 0) {
                        wiltoncall("fs_append_tl_file_writer", delim);
                    }
                }
            } finally {
                wiltoncall("fs_close_tl_file_writer");
            }
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function appendFile
     * 
     * Append data to a file, creating the file if it does not yet exist.
     * 
     * Appends data to a file, creating the file if it does not yet exist.
     * 
     * @param path `String` path to file
     * @param data `String|Array` data to write, can be a string or an array of strings;
     *             `options.delimiter` string is appended after every array element except the last one
     * @param options `Object|Undefined` configuration object, can be omitted, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     * 
     * __Options__
     *  - __hex__ `Boolean|Undefined` whether data is specified in hexadecimal encoding and needs
     *                      to be converted to binary before appending it to file;
     *                      `false` by default
     *  - __delimiter__ `String|Undefined` string that is appended after every array element
     *              except the last one, default value: `\n`
     */
    function appendFile(path, data, options, callback) {
        if ("undefined" === typeof(callback)) {
            callback = options;
        }
        writeOrAppend(path, data, {
            append: true,
            hex: extractHexOption(options),
            delimiter: extractDelimiterOption(options)
        }, callback);
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
     * @param path `String` path to file
     * @param options `Object|Undefined` configuration object, can be omitted, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `String` file contents
     * 
     * __Options__
     *  - __hex__ `Boolean|Undefined` whether data read from file needs
     *                      to be converted to hexadecimal encoding before returning it to caller;
     *                      `false` by default
     */
    function readFile(path, options, callback) {
        if ("undefined" === typeof (callback)) {
            callback = options;
        }
        try {
            var hexRequested = extractHexOption(options);
            var resHex = wiltoncall("fs_read_file", {
                path: path,
                hex: true
            });
            var res = resHex;
            if (!hexRequested) {
                var dataBytes = hex.decodeBytes(resHex);
                res = utf8.decode(dataBytes, /* lenient */ true);
            }
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function readLines
     * 
     * Reads all lines from a file.
     * 
     * Reads the entire contents of a text file and return them as an array of lines.
     * 
     * Empty strings are ignored.
     * 
     * @param path `String` path to file
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Array` file contents as an array of lines
     */
    function readLines(path, callback) {
        try {
            var json = wiltoncall("fs_read_lines", {
                path: path
            });
            var res = JSON.parse(json);
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function realpath
     * 
     * Convert relative path into absolute one.
     * 
     * Converts relative path into absolute one calling FS.
     * 
     * @param path `String` relative path
     * @param options `Undefined` placeholder parameter, added for compatibility with Node API
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `String` absolute path
     */
    function realpath(path, options, callback) {
        if ("undefined" === typeof (callback)) {
            callback = options;
        }
        try {
            var res = wiltoncall("fs_realpath", {
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
     * Deletes directory recursively.
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
     * @function isFile
     * 
     * Check whether path is an ordinary file.
     * 
     * Checks whether specified path is an ordinary file. Uses `stat(...).isFile`.
     * 
     * @param path `String`
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Boolean` `true` if specified path is an ordinary file, false otherwise
     */
    function isFile(path, callback) {
        return stat(path, callback).isFile;
    }

    /**
     * @function isDirectory
     * 
     * Check whether path is a directory.
     * 
     * Checks whether specified path is a directory. Uses `stat(...).isDirectory`.
     * 
     * @param path `String`
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Boolean` `true` if specified path is a directory, false otherwise
     */
    function isDirectory(path, callback) {
        return stat(path, callback).isDirectory;
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
     * @param data `String|Array` data to write, can be a string or an array of strings;
     *             `options.delimiter` string is appended after every array element except the last one
     * @param options `Object|Undefined` configuration object, can be omitted, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     * 
     * __Options__
     *  - __hex__ `Boolean|Undefined` whether data is specified in hexadecimal encoding and needs
     *                      to be converted to binary before writing it to file;
     *                      `false` by default
     *  - __delimiter__ `String|Undefined` string that is appended after every array element
     *              except the last one, default value: `\n`
     */
    function writeFile(path, data, options, callback) {
        if ("undefined" === typeof (callback)) {
            callback = options;
        }
        writeOrAppend(path, data, {
            append: false,
            hex: extractHexOption(options),
            delimiter: extractDelimiterOption(options)
        }, callback);
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

    /**
     * @function copyDirectory
     * 
     * Copy a directory.
     * 
     * Copies specified directory recursively.
     * 
     * @param oldPath `String` existing path
     * @param newPath `String` desired path
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     */
    function copyDirectory(oldPath, newPath, callback) {
        try {
            if (!(exists(oldPath) && stat(oldPath).isDirectory)) {
                throw new Error("Invalid source directory, path: [" + oldPath + "]");
            }
            if (exists(newPath)) {
                throw new Error("Target directory exists, path: [" + newPath + "]");
            }
            mkdir(newPath);
            var contents = readdir(oldPath);
            for(var i = 0; i < contents.length; i++) {
                var src = oldPath + "/" + contents[i];
                var target = newPath + "/" + contents[i];
                if (stat(src).isDirectory) {
                    copyDirectory(src, target);
                } else {
                    copyFile(src, target);
                }
            }
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function symlink
     * 
     * Create a symbolic link.
     * 
     * Creates a symbolic link to file or directory.
     * 
     * @param dest `String` destination path
     * @param link `String` path to link to create
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     */
    function symlink(dest, link, callback) {
        try {
            wiltoncall("fs_symlink", {
                dest: dest,
                link: link 
            });
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function insertFile
     * 
     * Writes the contents from one file to another.
     * 
     * Writes the contents of the specified source file to destination file, starts from offset.
     * 
     * @param sourcePath `String` path to source file 
     * @param destPath `String` path to destination file
     * @param offset `Number` offset from destination file write position
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     */
    function insertFile(sourcePath, destPath, offset, callback) {
        try {
            wiltoncall("fs_insert_file", {
                sourcePath: sourcePath,
                destPath: destPath,
                offset: offset 
            });
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function resizeFile
     * 
     * Resizes file
     * 
     * Resizes existing file or creates file with specified size
     * 
     * @param path `String` path to file
     * @param size `Number` offset from current target file write position
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     */
    function resizeFile(path, size, callback) {
        try {
            wiltoncall("fs_resize_file", {
                path: path,
                size: size 
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
        readLines: readLines,
        readLinesSync: readLines,
        realpath: realpath,
        realpathSync: realpath,
        rename: rename,
        renameSync: rename,
        rmdir: rmdir,
        rmdirSync: rmdir,
        stat: stat,
        statSync: stat,
        isFile: isFile,
        isDirectory: isDirectory,
        unlink: unlink,
        unlinkSync: unlink,
        writeFile: writeFile,
        writeFileSync: writeFile,
        copyFile: copyFile,
        copyFileSync: copyFile,
        copyDirectory: copyDirectory,
        copyDirectorySync: copyDirectory,
        symlink: symlink,
        symlinkSync: symlink,
        insertFile: insertFile,
        resizeFile: resizeFile
    };
});
