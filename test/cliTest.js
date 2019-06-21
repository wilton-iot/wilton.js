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
    "wilton/loader",
    "wilton/misc",
    "wilton/process"
], function(module, assert, fs, loader, misc, process) {
    "use strict";

    print("test: wilton/cli (launcher)");

    if (misc.isAndroid()) {
        return;
    }

    var whome = misc.wiltonConfig().wiltonHome;
    var executable = whome + "/bin/wilton";
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
        if (8 === code) {
            return "foreign_arch";
        }
        assert.equal(code, 0);
        var output = fs.readFile(outFile);
        fs.unlink(outFile);
        return output.trim();
    }

    var dir = loader.findModuleDirectory(module.id);

    // check can run
    var out = run(["-h"]);
    if ("foreign_arch" === out) {
        return;
    }

    // run script
    assert.equal(run([dir + "helpers/cliHelper.js"]), "helpers/cliHelper");

    // run script specifying mod
    assert.equal(run([dir + "helpers/cliHelper.js", "-s", "foo/bar"]), "foo/bar/cliHelper");

    // run one-liner
    // todo: windows quoting
    if (!misc.isWindows()) {
        assert.equal(run(["-e", "", "'foo' + 'bar'"]), "foobar");
    }

    // run script with binmod
    // todo: windows binmod path separator
    if (!misc.isWindows()) {
        var binmod = whome + "examples/binmod.wlib";
        assert.equal(run([dir + "helpers/cliHelperBinmod.js", "-b", binmod]), "binmod/cliHelper");
    }

});
