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
    "wilton/thread"
], function(assert, Channel, thread) {
    "use strict";

    print("test: wilton/thread");

    var chanOut = new Channel("threadTestOut");
    var chanIn = new Channel("threadTestIn");

    thread.run({
        callbackScript: {
            module: "wilton/test/helpers/threadHelper",
            func: "increment1"
        }
    });

    chanOut.send(42);
    assert.equal(chanIn.receive(), 43);
    
    // wait for thread to die
    thread.sleepMillis(100);

    chanOut.close();
    chanIn.close();
});
