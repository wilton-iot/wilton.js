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
    "wilton/httpClient",
    "wilton/utils"
], function(assert, Channel, http, utils) {
    "use strict";

    function httpGet(url, meta) {
        var mt = utils.defaultObject(meta);
        mt.method = "GET";
        mt.abortOnResponseError = false;
        mt.connecttimeoutMillis = 20000;
        mt.timeoutMillis = 60000;
        var resp = http.sendRequest(url, {
            meta: mt
        });
        return resp.data;
    }

    function httpGetHeader(url, header, meta) {
        var mt = utils.defaultObject(meta);
        mt.method = "GET";
        mt.abortOnResponseError = false;
        mt.connecttimeoutMillis = 20000;
        mt.timeoutMillis = 60000;
        var resp = http.sendRequest(url, {
            meta: mt
        });
        return resp.headers[header];
    }

    function httpGetCode(url, meta) {
        var mt = utils.defaultObject(meta);
        mt.method = "GET";
        mt.abortOnResponseError = false;
        mt.connecttimeoutMillis = 20000;
        mt.timeoutMillis = 60000;
        var resp = http.sendRequest(url, {
            meta: mt
        });
        return resp.responseCode;
    }

    function httpPost(url, data, meta) {
        var mt = utils.defaultObject(meta);
        mt.method = "POST";
        mt.abortOnResponseError = false;
        mt.connecttimeoutMillis = 20000;
        mt.timeoutMillis = 60000;
        var resp = http.sendRequest(url, {
            data: data,
            meta: mt
        });
        return resp.data;
    }

    function postAndIncrement() {
        var chan = Channel.lookup("clientTest");
        for (var i = 0; i < 10; i++) {
            var resp = http.sendRequest("http://127.0.0.1:8080/wilton/test/views/postmirror", {
                data: "foobar",
                meta: {
                    timeoutMillis: 60000
                }
            });
            assert("foobar" === resp.data);
            assert(chan.offer({
                data: resp.data
            }));
        }
    }

    return {
        httpGet: httpGet,
        httpGetHeader: httpGetHeader,
        httpGetCode: httpGetCode,
        httpPost: httpPost,
        postAndIncrement: postAndIncrement
    };
});


