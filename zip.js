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
 * @namespace zip
 * 
 * __wilton/zip__ \n
 * Read and write ZIP files
 * 
 * This module allows to read and write files
 * in [ZIP format](https://en.wikipedia.org/wiki/Zip_%28file_format%29).
 * 
 * Usage example:
 * 
 * @code
 * 
 * // create ZIP file
 * zip.writeFile("test.zip", {
 *     foo: "bar",
 *     "bazdir1/bazdir2/bazfile": "boo"
 * });
 * 
 * // list entries in ZIP file
 * zip.listFileEntries("test.zip");
 *
 * // read single ZIP entry from file 
 * zip.readFileEntry("test.zip", "foo");
 * 
 * // read all contens of ZIP file
 * zip.readFile("test.zip");
 * 
 * @endcode
 */

define([
    "./dyload",
    "./utils",
    "./wiltoncall"
], function(dyload, utils, wiltoncall) {
    "use strict";

    dyload({
        name: "wilton_zip"
    });

    function extractHexOption(options) {
        if ("object" === typeof(options) && null !== options) {
            var props = utils.listProperties(options);
            if (1 !== props.length || "hex" !== props[0] || "boolean" !== typeof(options.hex)) {
                throw new Error("Invalid 'options' object, properties: [" + JSON.stringify(props) + "]");
            }
            return options.hex;
        }
        return false;
    }

    /**
     * @function readFile
     * 
     * Read the entire contents of a ZIP file.
     * 
     * Reads the entire contents of a ZIP file into "zip_entry_name" -> "zip_entry_contents"
     * mapping. "zip_entry_contents" may be optionally encoded into hexadecimal
     * (useful for binary data) if `hex: true` option is specified.
     * 
     * @param path `String` path to file
     * @param options `Object|Undefined` configuration object, can be omitted, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Object` "zip_entry_name" -> "zip_entry_contents" mapping
     * 
     * __Options__
     *  - __hex__ `Boolean` whether data read from ZIP entries needs
     *                      to be converted to HEX format before returning it to caller;
     *                      `false` by default
     */
    function readFile(path, options, callback) {
        if ("undefined" === typeof (callback)) {
            callback = options;
        }
        try {
            var resstr = wiltoncall("zip_read_file", {
                path: path,
                hex: extractHexOption(options)
            });
            var res = JSON.parse(resstr);
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function readFileEntry
     * 
     * Read the contents of a specified entry from a ZIP file.
     * 
     * Reads the contents of a specified entry from a ZIP file.
     * Resulting string may be optionally encoded into hexadecimal
     * (useful for binary data) if `hex: true` option is specified.
     * 
     * @param path `String` path to file
     * @param entry `String` entry name inside the ZIP file
     * @param options `Object|Undefined` configuration object, can be omitted, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `String` entry contents
     * 
     * __Options__
     *  - __hex__ `Boolean` whether data read from specified ZIP entry needs
     *                      to be converted to HEX format before returning it to caller;
     *                      `false` by default
     */
    function readFileEntry(path, entry, options, callback) {
        if ("undefined" === typeof (callback)) {
            callback = options;
        }
        try {
            var res = wiltoncall("zip_read_file_entry", {
                path: path,
                entry: entry,
                hex: extractHexOption(options)
            });
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function unzipFileEntries
     * 
     * Unzip the specified ZIP entries into FS.
     * 
     * Takes the mapping of `src_path_in_zip` -> `dest_path_in_fs`
     * and decompresses the specified entries to specifieed filesystems
     * paths.
     * 
     * @param path `String` path to file
     * @param entries `Object` `src_path_in_zip` -> `dest_path_in_fs`
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     * 
     */
    function unzipFileEntries(path, entries, callback) {
        try {
            wiltoncall("zip_unzip_file_entries", {
                path: path,
                entries: entries
            });
            return utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function unzipFile
     * 
     * Unzip ZIP file into FS.
     * 
     * Unzips all entries from the specified ZIP file into filesystem.
     * 
     * @param path `String` path to file
     * @param destPath `String` path to the directory that will correspond to the
     *                  root entry of the ZIP file
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     * 
     */
    function unzipFile(path, destPath, callback) {
        try {
            var list = listFileEntries(path);
            var entries = {};
            for (var i = 0; i < list.length; i++) {
                var en = list[i];
                entries[en] = destPath + "/" + en;
            }
            wiltoncall("zip_unzip_file_entries", {
                path: path,
                destRoot: destPath,
                entries: entries
            });
            return utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function listFileEntries
     * 
     * List all the entries names from a ZIP file.
     * 
     * Reads a central directory record from a ZIP file and returns a
     * list of ZIP entry names.
     * 
     * @param path `String` path to file
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Array` list of ZIP entry names
     * 
     */
    function listFileEntries(path, callback) {
        try {
            var resstr = wiltoncall("zip_list_file_entries", {
                path: path
            });
            var res = JSON.parse(resstr);
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function writeFile
     * 
     * Write the specified set of entries into ZIP file.
     * 
     * Writes the specified "zip_entry_name" -> "zip_entry_contents"
     * mapping into ZIP file. "zip_entry_contents" may be optionally decoded
     * from hexadecimal (useful for binary data) if `hex: true` option is specified.
     * 
     * Entries are sorted by keys in alphabetical order.
     * 
     * @param path `String` path to file
     * @param entries `Object` "zip_entry_name" -> "zip_entry_contents" mapping
     * @param options `Object|Undefined` configuration object, can be omitted, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Undefined`
     * 
     * __Options__
     *  - __hex__ `Boolean|Undefined` whether ZIP entry data needs to be converted to
     *                      to HEX format before wrting it to ZIP file;
     *                      `false` by default
     *  - __fsPaths__ `Boolean|Undefined` whether ZIP entry data represents paths in filesystem
     *                      that should be read and compressed into ZIP file;
     *                      `false` by default
     */
    function writeFile(path, entries, options, callback) {
        if ("undefined" === typeof (callback)) {
            callback = options;
        }
        var opts = utils.defaultObject(options);
        try {
            // prepare entries
            if ("object" !== typeof(entries) || null === entries) {
                throw new Error("Invalid 'entries' parameter, must be and 'object'");
            }
            var entryNames = [];
            for (var key in entries) {
                if (entries.hasOwnProperty(key)) {
                    entryNames.push(key);
                }
            }
            entryNames.sort(function(a, b) {
                var nameA = utils.defaultString(a);
                var nameB = utils.defaultString(b);
                return nameA.localeCompare(nameB);
            });
            // use thread-local writer
            wiltoncall("zip_open_tl_file_writer", {
                path: path,
                entries: entryNames,
                hex: opts.hex || false,
                fsPaths: opts.fsPaths || false
            });
            try {
                for (var i = 0; i < entryNames.length; i++) {
                    var key = entryNames[i];
                    wiltoncall("zip_write_tl_entry_content", entries[key]);
                }
            } finally {
                wiltoncall("zip_close_tl_file_writer");
            }
            return utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    return {
        readFile: readFile,
        readFileEntry: readFileEntry,
        unzipFileEntries: unzipFileEntries,
        unzipFile: unzipFile,
        listFileEntries: listFileEntries,
        writeFile: writeFile
    };
});
