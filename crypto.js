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

/**
 * @namespace crypto
 * 
 * __wilton/crypto__ \n
 * Cryptography operations.
 * 
 * This module provides access to cryptography operations:
 * encryption and hash sum computation. Processing is done
 * on files without loading all their content into memory.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // compute SHA-256 from file contents
 * var sha256 = crypto.hashFile({
 *   filePath: plain
 * });
 *
 * // create encryption key and init vector
 * // from arbitrary secret string
 * var pars = crypto.createCryptKey("mysecret");
 * 
 * // encrypt file
 * crypto.encryptFile({
 *     filePath: "path/to/plain.txt",
 *     destFilePath: "path/to/encrypted.dat",
 *     cryptKey: pars.cryptKey,
 *     initVec: pars.initVec
 * });
 * 
 * // decrypt file
 * crypto.decryptFile({
 *     filePath: "path/to/encrypted.dat",
 *     destFilePath: "path/to/decrypted.txt",
 *     cryptKey: pars.cryptKey,
 *     initVec: pars.initVec
 * });
 * 
 * @endcode
 */
define([
    "./dyload",
    "./utils",
    "./wiltoncall"
], function(dyload, utils, wiltoncall) {
    "use strict";

    dyload({
        name: "wilton_crypto"
    });

    /**
     * @function hashFile
     * 
     * Compute SHA256 sum of a file.
     * 
     * Computes SHA256 hash sum from the contents of a specified file.
     * Hash sum value returned as a hexadecimal string.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `String`
     * 
     * __Options__
     *  - __filePath__ `String` path to the file to compute SHA256
     */
    function hashFile(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            var res = wiltoncall("crypto_hash256", opts);
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function encryptFile
     * 
     * AES encryption.
     * 
     * Encrypts specified file using AES with specifief encryption
     * key and initialization vector.
     * 
     * Key an IV may be created with `createCryptKey`.
     * 
     * Results are written to the specified destination path.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     * 
     * __Options__
     *  - __filePath__ `String` path to the file to encrypt
     *  - __desfilePath__ `String` path to the file to write encryption results into
     *  - __cryptKey__ `String` encryption key in hexadecimal, must be 32 bytes long
     *  - __initVec__ `String` init vector in hexadecimal, must be 16 bytes long
     */
    function encryptFile(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            opts.operation = "encrypt";
            var res = wiltoncall("crypto_aes", opts);
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function decryptFile
     * 
     * AES decryption.
     * 
     * Decrypts specified file using AES with specifief encryption
     * key and initialization vector.
     * 
     * Key an IV may be created with `createCryptKey`.
     * 
     * Results are written to the specified destination path.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     * 
     * __Options__
     *  - __filePath__ `String` path to the file to decrypt
     *  - __desfilePath__ `String` path to the file to write decryption results into
     *  - __cryptKey__ `String` encryption key in hexadecimal, must be 32 bytes long
     *  - __initVec__ `String` init vector in hexadecimal, must be 16 bytes long
     */
    function decryptFile(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            opts.operation = "decrypt";
            var res = wiltoncall("crypto_aes", opts);
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function createCryptKey
     * 
     * Create crypt params from the specified string.
     * 
     * Deterministically creates encryption key and initialization vector from the specified
     * input string.
     * 
     * @param secret `String` input secret string to create crypt params
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Object` with the following fields:
     * 
     *  - __cryptKey__ `String` encryption key in hexadecimal
     *  - __initVec__ `String` initialization vector in hexadecimal
     * 
     */
    function createCryptKey(secret, callback) {
        try {
            var resJson = wiltoncall("crypto_aes_create_crypt_key", {
                secret: secret
            });
            var res = JSON.parse(resJson);
            return utils.callOrIgnore(callback, res);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    return {
        hashFile: hashFile,
        encryptFile: encryptFile,
        decryptFile: decryptFile,
        createCryptKey: createCryptKey
    };
});

