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

define([
    "assert",
    "wilton/fs",
    "wilton/misc",
    "wilton/wiltoncall"
    ], function(assert, fs, misc, wiltoncall) {
    return {
        GET: function(req) {
            req.sendResponse({
                msg: "hello from GET handler",
                inputData: req.meta().queries
            });
        },

        POST: function(req) {
            var tmp_filename = req.dataFilename();

            var dir = req.headers()["X-Scratch-Dir"];
            var save_dir = dir + "/tmp/";
            if (!fs.exists(save_dir)) {
                fs.mkdir(save_dir);
            }

            var headers = req.headers();
            var chunk_number = parseInt(headers["X-Wilton-FileUpload-ChunkNumber"]);
            var chunk_size = parseInt(headers["X-Wilton-FileUpload-ChunksMaxSizeBytes"]);
            var file_size = parseInt(headers["X-Wilton-FileUpload-FileSize"]);
            var file_name = headers["X-Wilton-FileUpload-FileName"];
            var file_hash = headers["X-Wilton-FileUpload-FileHash256"];

            var new_file = save_dir + file_name;

            if (!fs.exists(new_file)) {
                res = wiltoncall("fs_resize_file", { 
                    path: new_file, 
                    size: file_size
                });
            }

            res = wiltoncall("fs_insert_file", {
                sourcePath: tmp_filename, 
                destPath: new_file, 
                offset: chunk_number*chunk_size
            });

            req.sendResponse({
                msg: "hello from POST handler",
                inputData: { "writed_part": chunk_number}
            });
        }
    };
});