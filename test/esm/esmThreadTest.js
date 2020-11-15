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
const { Channel, misc, thread } = wilton;

print("test: wilton/esm/Thread");

var chanOut = new Channel("threadTestOut");
var chanIn = new Channel("threadTestIn");

var engine = misc.wiltonConfig().defaultScriptEngine;

var threadExitChan = thread.run({
    callbackScript: {
        esmodule: `${import.meta.dir}/helpers/esmThreadHelper.js`
    },
    capabilities: [
        "get_wiltoncall_config", // init script engine
        "runscript_" + engine, // run script on a default engine
        "load_module_resource", // required by require.js on duktape
        "dyload_shared_library", // required by wilton/Channels
        "channel_lookup",
        "channel_offer",
        "channel_receive",
        "channel_send"
    ]
});

chanOut.send(42);
assert.equal(chanIn.receive(), 43);

// wait for thread to die
threadExitChan.receiveAndClose();

chanOut.close();
chanIn.close();