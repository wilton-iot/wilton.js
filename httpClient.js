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

/**
 * @namespace httpClient
 * 
 * __wilton/httpClient__ \n
 * HTTP client.
 * 
 * This module allows to send HTTP requests.
 * 
 * By default HTTP connections are cached into the single process-wide
 * connection pool and can be reused from different threads.
 * 
 * This module supports HTTPS and request with `X.509` client certificates.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // send GET request
 * var resp1 = http.sendRequest("https://google.com");
 * 
 * // send POST request
 * var resp2 = http.sendRequest(url, {
 *     data: "foo",
 *     meta: {
 *         method: "POST"
 *     }
 * });
 * 
 * 
 * // send file
 * var resp3 = http.sendFile(url, {
 *     filePath: "path/to/file.txt"
 * });
 * 
 * @endcode
 */
define([
    "utf8",
    "./dyload",
    "./hex",
    "./utils",
    "./wiltoncall"
], function(utf8, dyload, hex, utils, wiltoncall) {
    "use strict";

    dyload({
        name: "wilton_http"
    });

    function _checkStrayOpts(opts) {
        for (var pr in opts) {
            if ("data" !== pr && "meta" !== pr && "filePath" !== pr) {
                throw new Error("Invalid option specified: [" + pr + "]");
            }
        }
    }

    function _jsonParse(callback) {
        try {
            if (null === this.jsonCached) {
                var json = this.data;
                this.jsonCached = JSON.parse(json);
            }
            utils.callOrIgnore(callback, this.jsonCached);
            return this.jsonCached;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function sendRequest
     * 
     * Send HTTP request to server.
     * 
     * Sends HTTP request to server, received response
     * can be stored in-memory or in the specified file
     * (in this case response will be written into the file in streaming mode).
     * 
     * @param url `String` URL of the HTTP server
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Object` response object with the following fields:
     * 
     *  - __connectionSuccess__ `Boolean` `true` if the connection to server was successful,
     *                          `false` otherwise
     *  - __dataHex__ `String` response data in hexadecimal encoding, use `wilton/hex`to
     *                decode it; response may contain code sequences that are not valid for
     *                `UTF-8` encoding
     *  - __data__ `String` data decoded as a `String` with invalid `UTF-8` code sequences
     *             replaced with `0xFFFD`
     *  - __json__ `Function` parses the contents of `data` field as a JSON, resulting
     *             JSON object is cached for this response instance - the same object is
     *             returned for the following `json()` invocations
     *  - __headers__ `Object` response headers in `"Header-Name": "value"` format
     *  - __effectiveUrl__ `String` final URL (after possible redirection) that was used
     *  - __responseCode__ `Number` HTTP response status code
     *  - __totalTimeSecs__ `Number` time that request have taken, in seconds
     *  - __namelookupTimeSecs__ `Number` time spent in DNS lookup, in seconds
     *  - __connectTimeSecs__ `Number` time spent establishing the connection, in seconds
     *  - __appconnectTimeSecs__ `Number` time until the SSL handshake is completed, in seconds
     *  - __pretransferTimeSecs__ `Number` time until the file transfer start, in seconds
     *  - __starttransferTimeSecs__ `Number` time until the first byte is received, in seconds
     *  - __redirectTimeSecs__ `Number` time for all redirection steps, in seconds
     *  - __redirectCount__ `Number` number of redirects
     *  - __speedDownloadBytesSecs__ `Number` download speed, in bytes per second
     *  - __speedUploadBytesSecs__ `Number` upload speed, in bytes per second
     *  - __headerSizeBytes__ `Number` size of response headers, in bytes
     *  - __requestSizeBytes__ `Number` size of sent request, in bytes
     *  - __sslVerifyresult__ `Number` result of the certificate verification
     *  - __osErrno__ `Number` error code returned by OS
     *  - __numConnects__ `Number` number of created connections
     *  - __primaryIp__ `String` IP address of last connection
     *  - __primaryPort__ `Numbrer` TCP port of last connection
     * 
     * __Options__
     * 
     *  - __data__ `String|Object|Undefined` data to send in request body, specified object
     *             will be converted to JSON
     *  - __meta__: `Object|Undefined` request metadata
     *    - __headers__ `Object|Undefined` request headers in `"Header-Name": "value"` format
     *    - __method__ `String|Undefined` HTTP method to use for this request, default value
     *                 is `GET`, if request `data` is not specified, `POST` otherwise
     *    - __abortOnConnectError__ `Boolean|Undefined` whether to throw an `Error` on connection fail,
     *                              default value: `true`
     *    - __abortOnResponseError__ `Boolean|Undefined` whether to throw an `Error`, if response status
     *                               code `>=400` is returned, default value: `true`
     *    - __maxNumberOfResponseHeaders__ `Number|Undefined` maximum number of response headers to receive,
     *                                     subsequent headers will be ignored, default value: `128`
     *    - __consumerThreadWakeupTimeoutMillis__ `Number|Undefined` consumer threads wakeup timeout,
     *                                            in milliseconds, default value: `100`
     *    - __responseDataFilePath__ `String|Undefined` path to file where to write the response body
     *    - __forceHttp10__ `Boolean|Undefined` whether to use HTTP `1.0` protocol closing the connection
     *                      after the request, default value: `false`
     *    - __noprogress__ `Boolean|Undefined` whether to swith off the progress meter, default value `true`
     *    - __nosignal__ `Boolean|Undefined` whether to disable OS-signals handling, default value: `true`
     *    - __failonerror__ `Boolean|Undefined` whether to close the connection and throw an `Error` on
     *                      response code `>=400`,default value: `false`
     *    - __pathAsIs__ `Boolean|Undefined` whether to not handle "dot sequences" in request URL,
     *                   default value: `true`
     *    - __tcpNodelay__ `Boolean|Undefined` whether to set the `TCP_NODELAY` connection option,
     *                     default value: `false`
     *    - __tcpKeepalive__ `Boolean|Undefined` whether to use TCK keep-alive probing, default value: `false`
     *    - __tcpKeepidleSecs__ `Number|Undefined` TCP keep-alive idle time wait, in seconds, default value: `300`
     *    - __tcpKeepintvlSecs__ `Number|Undefined` TCP keep-alive interval, in seconds, default value: `300`
     *    - __connecttimeoutMillis__ `Number|Undefined` timeout for the connect phase, in milliseconds,
     *                               default value: `10000`
     *    - __timeoutMillis__ `Number|Undefined` maximum time the request is allowed to take, in milliseconds,
     *                        default value: `15000`
     *    - __buffersizeBytes__ `Number|Undefined` preferred receive buffer size, in bytes, default value: `16384`
     *    - __acceptEncoding__ `String|Undefined` enables automatic decompression of HTTP downloads,
     *                         default value: `gzip`
     *    - __followlocation__ `Boolean|Undefined` whether to follow HTTP `3xx` redirects, default value: `true`
     *    - __maxredirs__ `Number|Undefined` maximum number of redirects allowed, default value: `32`
     *    - __useragent__ `String|Undefined` user-agent string to send, default value: empty string
     *    - __maxSentSpeedLargeBytesPerSecond__ `Number|Undefined` rate limit data upload speed, in bytes per second,
     *                                          default value: `0` (disabled)
     *    - __maxRecvSpeedLargeBytesPerSecond__ `Number|Undefined` rate limit data download speed, in bytes per second,
     *                                          default value: `0` (disabled)
     *    - __sslcertFilename__ `String|Undefined` path to SSL client certificate file
     *    - __sslcertype__ `String|Undefined` type of the client SSL certificate
     *    - __sslkeyFilename__ `String|Undefined` path to private keyfile for TLS and SSL client certificate
     *    - __sslKeyType__ `String|Undefined` type of the private key file
     *    - __sslKeypasswd__ `String|Undefined` passphrase to private key
     *    - __requireTls__ `Boolean|Undefined` whether to require TLS connection rejectin older SSL algorithms,
     *                     default value: `false`
     *    - __sslVerifyhost__ `Boolean|Undefined` whether to verify the certificate's name against host,
     *                        default value: `false`
     *    - __sslVerifypeer__ `Boolean|Undefined` whether to verify the peer's SSL certificate,
     *                        default value: `false`
     *    - __sslVerifystatus__ `Boolean|Undefined` whether to verify the peer certificate's status,
     *                          default value: `false`
     *    - __cainfoFilename__ `String|Undefined` path to Certificate Authority (CA) bundle
     *    - __crlfileFilename__ `String|Undefined` path to CRL file
     *    - __sslCipherList__ `String|Undefined` ciphers to use for TLS
     */
    function sendRequest(url, options, callback) {
        var opts = utils.defaultObject(options);
        try {
            _checkStrayOpts(opts);
            var urlstr = utils.defaultString(url);
            var dt = "";
            if (!utils.undefinedOrNull(opts.data)) {
                dt = utils.defaultJson(opts.data);
            }
            var meta = utils.defaultObject(opts.meta);
            var resp_json = wiltoncall("httpclient_send_request", {
                url: urlstr,
                data: dt,
                metadata: meta
            });
            var resp = JSON.parse(resp_json);
            var dataBytes = hex.decodeBytes(resp.dataHex);
            resp.data = utf8.decode(dataBytes, /* lenient */ true);
            resp.jsonCached = null;
            resp.json = _jsonParse;
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    /**
     * @function sendFile
     * 
     * Send specified file to server.
     * 
     * Sends specified file to server using `POST` request method by default.
     * 
     * Specified file is read in streaming mode without loading the whole
     * file into memory.
     * 
     * @param url `String` URL of the HTTP server
     * @param options `Object` configuration object, see details in `sendRequest()` function
     * @param callback `Function|Undefined` callback to receive result or error
     * @returns `Object` response object, see details in `sendRequest()` function
     */
    function sendFile(url, options, callback) {
        var opts = utils.defaultObject(options);
        try {
            _checkStrayOpts(opts);
            var urlstr = utils.defaultString(url);
            var fp = utils.defaultString(opts.filePath);
            var meta = utils.defaultObject(opts.meta);
            var resp_json = wiltoncall("httpclient_send_file", {
                url: urlstr,
                filePath: fp,
                metadata: meta,
                remove: true === opts.remove
            });
            var resp = JSON.parse(resp_json);
            var dataBytes = hex.decodeBytes(resp.dataHex);
            resp.data = utf8.decode(dataBytes, /* lenient */ true);
            resp.jsonCached = null;
            resp.json = _jsonParse;
            utils.callOrIgnore(callback, resp);
            return resp;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return {
        sendRequest: sendRequest,
        sendFile: sendFile
    };
});
