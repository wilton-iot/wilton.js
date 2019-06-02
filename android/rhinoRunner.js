/*
 * Copyright 2019, alex at staticlibs.net
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
    "wilton/Channel",
    "./callJsModule"
], function(Channel, callJsModule) {
    "use strict";

    return function() {
        var input = new Channel("rhino/input");
        var output = new Channel("rhino/output");
        var killswitch = new Channel("rhino/killswitch", 1);
        while (null === killswitch.poll()) {
            var idx = Channel.select([input, killswitch]);
            if (0 === idx) { // input
                var desc = input.receive();
                var res = callJsModule(desc);
                var msg = "undefined" !== typeof(res) ? res : {};
                output.send(msg);
            }
        }
    };
});
