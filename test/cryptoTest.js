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

define([
    "assert",
    "wilton/crypto",
    "wilton/fs",
    "./_scratchDir"
], function(assert, crypto, fs, scratchDir) {
    "use strict";

    print("test: wilton/crypto");

    // prepare
    var dir = scratchDir + "cryptoTest/";
    fs.mkdir(dir);
    var plain = dir + "plain.txt";
    var sec = dir + "sec.dat";
    var unsec = dir + "unsec.dat";
    fs.writeFile(plain, "foo");

    // hash
    var sha256 = crypto.hashFile({
        filePath: plain
    });
    assert.equal(sha256, "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae");

    // crypt key
    var pars = crypto.createCryptKey("foo");
    assert.equal(pars.cryptKey, "7198573a54ca3fbe4ac49c95b3409cf983196e613e61388896b30c764f0900e6");
    assert.equal(pars.initVec, "ede5555d0175af5cefd363723d463aa4");

    // encrypt
    crypto.encryptFile({
        filePath: plain,
        destFilePath: sec,
        cryptKey: pars.cryptKey,
        initVec: pars.initVec
    });
    assert(fs.exists(sec));
    assert(fs.stat(sec).size > 0);
    assert("foo" !== fs.readFile(sec));

    // decrypt
    crypto.decryptFile({
        filePath: sec,
        destFilePath: unsec,
        cryptKey: pars.cryptKey,
        initVec: pars.initVec
    });
    assert(fs.exists(sec));
    assert.equal(fs.readFile(unsec), "foo");

    // cleanup
    fs.rmdir(dir);
});
