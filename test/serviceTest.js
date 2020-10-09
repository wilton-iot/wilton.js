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
    "wilton/service",
    "wilton/thread"
], function(assert, fs, service, thread) {
    "use strict";

    print("test: wilton/service");

    var pid = service.getPid();
    assert(pid >= 0);

    var memory = service.getMemorySize();
    assert(memory > 0);

    var threadExitChan = thread.run({
        callbackScript: {
            module: "wilton/test/helpers/threadHelper",
            func: "increment1"
        }
    });

    var threadQty = service.getThreadsCount();
    assert(threadQty === 1);

    service.traceTurnOn();

    assert(service.isTraceOn());

    var callStack = service.getCurrentCallStack();
    assert(callStack === "root/");

    var calls = service.getAllCalls();
    assert(calls === "");

    service.traceTurnOff();
    assert(!service.isTraceOn());
    threadExitChan.receiveAndClose();

});
