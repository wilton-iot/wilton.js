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
    "wilton/Channel",
    "wilton/fs",
    "wilton/httpClient",
    "wilton/misc",
    "wilton/Server",
    "wilton/thread"
], function(assert, Channel, fs, http, misc, Server, thread) {
    "use strict";

    print("test: wilton/httpClient");

    var appdir = misc.wiltonConfig().applicationDirectory;

    var server = new Server({
        tcpPort: 8080,
        views: [
            "wilton/test/views/hi",
            "wilton/test/views/savefile",
            "wilton/test/views/postmirror"
        ],
        requestPayload: {
            tmpDirPath: appdir,
            memoryLimitBytes: 20000
        }
    });

    var resp = http.sendRequest("http://127.0.0.1:8080/wilton/test/views/hi", {
        meta: {
            forceHttp10: true,
            timeoutMillis: 60000
        }
    });
    assert.equal(resp.data, "Hi from wilton_test!");
    assert.equal(resp.headers.Connection, "close");
    
    var resp = http.sendRequest("http://127.0.0.1:8080/wilton/test/views/postmirror", {
        data: "foobar",
        meta: {
            timeoutMillis: 60000
        }
    });
    assert.equal(resp.data, "foobar");

    // threads

    var chan = new Channel("clientTest", 64);
    
    var num_workers = 2;
    var target = num_workers * 10;
    
    for (var i = 0; i < num_workers; i++) {
        thread.run({
            callbackScript: {
                "module": "wilton/test/helpers/httpClientHelper",
                "func": "postAndIncrement"
            }
        });
    }

    for(var count = 0; count < target; count++) {
        var msg = chan.receive();
        assert.deepEqual(msg, {
            data: "foobar"
        });
        print("test: wilton/httpClient, waiting, count: [" + count + "] of: [" + target + "]");
    }
    chan.close();

    // response data to file
    var resp = http.sendRequest("http://127.0.0.1:8080/wilton/test/views/postmirror", {
        data: "foobaz",
        meta: {
            timeoutMillis: 60000,
            responseDataFilePath: appdir + "httpClientTest.response"
        }
    });
    var data_obj = JSON.parse(resp.data);
    assert.equal(data_obj.responseDataFilePath, appdir + "httpClientTest.response");
    var contents = fs.readFile(appdir + "httpClientTest.response");
    assert.equal(contents, "foobaz");

    // send file
    fs.writeFile(appdir + "clientTestSend.txt", "foobaf");
    var respFile = http.sendFile("http://127.0.0.1:8080/wilton/test/views/postmirror", {
        filePath: appdir + "clientTestSend.txt",
        meta: {
            timeoutMillis: 60000
        }
    });
    assert.equal(respFile.data, "foobaf");
    assert(fs.exists(appdir + "clientTestSend.txt"));
    fs.unlink(appdir + "clientTestSend.txt");
    assert(!fs.exists(appdir + "clientTestSend.txt"));

    // send file by parts
    var tmp_dir = appdir + "tmp/";
    if (fs.exists(tmp_dir)) {
        fs.rmdir(tmp_dir);
    }
    fs.mkdir(tmp_dir);
    fs.writeFile(tmp_dir + "test_part_send.txt", "foobar");
    var respFileSend = "none"
    respFileSend = http.sendFileByParts("http://127.0.0.1:8080/wilton/test/views/savefile", {
        filePath: tmp_dir + "test_part_send.txt",
        meta: {
            timeoutMillis: 60000,
            method: "POST"
        },
        sendOptions: {
            fileName: "part_file.txt",
            fullTimeoutMillis: 140000,
            maxChunkSize: 3
        }
    });
    var saved_file = tmp_dir + "part_file.txt";
    assert(fs.exists(saved_file));
    var stat = fs.stat(saved_file);
    assert.equal(stat.size, 6);
    assert.equal(fs.readFile(saved_file), "foobar");
    fs.rmdir(tmp_dir);

    server.stop();

});
