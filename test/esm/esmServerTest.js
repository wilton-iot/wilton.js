/*
 * Copyright 2020, alex at staticlibs.net
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

import assert from "assert";
import wilton from "wilton";
const { Server, httpClient } = wilton;

print("test: wilton/esm/Server");

const server = new Server({
    tcpPort: 8080,
    views: [{
        method: "POST",
        path: "hello",
        esmodule: `${import.meta.dir}/helpers/esmServerView.js`
    }]
});

const resp = httpClient.sendRequest("http://127.0.0.1:8080/hello", {
    data: "hi"
});

assert.equal(resp.responseCode, 200);
assert.equal(resp.data, "hi");