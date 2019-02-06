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
    "module",
    "assert",
    "wilton/fs",
    "wilton/misc",
    "wilton/process",
    "wilton/utils"
], function(module, assert, fs, misc, process, utils) {
    "use strict";

    print("test: wilton/cli (launcher)");

    if (misc.isAndroid()) {
        return;
    }

    var appdir = misc.wiltonConfig().applicationDirectory;
    var executable = appdir + "/bin/wilton";
    if (misc.isWindows()) { 
        executable += ".exe";
    }

    function run(args) {
        var outFile = "cliTest_out.txt";
        var code = process.spawn({
            executable: executable, 
            args: args, 
            outputFile: outFile,
            awaitExit: true
        });
        assert.equal(code, 0);
        var output = fs.readFile(outFile);
        fs.unlink(outFile);
        return output.trim();
    }

    var dir = utils.moduleDirectory(module);

    // run script
    assert.equal(run([dir + "helpers/cliHelper.js"]), "helpers/cliHelper");

    // run script specifying mod
    assert.equal(run([dir + "helpers/cliHelper.js", "-s", "foo/bar"]), "foo/bar/cliHelper");

    // run one-liner
    assert.equal(run(["-e", "", "'foo' + 'bar'"]), "foobar");

    // run script with binmod
    var binmod = appdir + "examples/binmod.wlib";
    assert.equal(run([dir + "helpers/cliHelperBinmod.js", "-b", binmod]), "binmod/cliHelper");

});
