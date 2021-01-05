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
], function() {
    "use strict";

    var DeviceService = Packages.wilton.android.DeviceService;
    var Intent = Packages.android.content.Intent;

    var mainActivity = Packages.wilton.android.MainActivity.INSTANCE;

    return function(application, rootModuleName, startupCallDesc) {
        // stop possible leftover
        mainActivity.stopService(new Intent(mainActivity, DeviceService));

        // start device service
        var intent = new Intent(mainActivity, DeviceService);
        intent.putExtra("wilton_application", application);
        intent.putExtra("wilton_rootModuleName", rootModuleName);
        intent.putExtra("wilton_startupModule", startupCallDesc.module);
        // todo: structured args
        for (var i = 0; i < startupCallDesc.args.length; i++) {
            var arg = startupCallDesc.args[i];
            intent.putExtra("wilton_startupArg" + i, arg);
        }
        mainActivity.startService(intent);
    };
});
