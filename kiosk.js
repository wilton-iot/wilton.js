/*
 * Copyright 2018, alex at staticlibs.net
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
 * @namespace kiosk
 * 
 * __wilton/kiosk__ \n
 * Open WebView window as a Kiosk.
 * 
 * This module allows to open and run the WebView window in the current thread.
 * 
 * Caller thread remains blocked until the WebView window is closed.
 * 
 * Currently only Linux/GTK+ backend is implemented, see OpenJFX-based
 * WebView example for non-Linux platforms: https://github.com/wilton-iot/examples/blob/wilton/webview.js#L17
 * 
 * Usage example:
 * 
 * @code
 * 
 * // open URL in a non-fullscreen window
 * kiosk.run({
 *     url: "http://localhost:8080",
 *     fullscreen: false,
 *     width: 800,
 *     height: 600
 * });
 * 
 * @endcode
 * 
 */
define([
    "./dyload",
    "./wiltoncall",
    "./utils"
], function(dyload, wiltoncall, utils) {
    "use strict";

    dyload({
        name: "wilton_kiosk"
    });

    /**
     * @function run
     * 
     * Open and run a WebView window in a current thread
     * 
     * Opens a WebView window with a specified URL to load.
     * 
     * Current thread remains blocked until WebView window is closed.
     * 
     * @param options `Object` configuration object, see possible options below
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Undefined`
     * 
     * __Options__
     *  - __url__ `String` web address to load in this WebView
     *  - __fullscreen__ `Boolean|Undefined` whether to make a window full-screen,
     *                   default value: `true`
     *  - __fullscreenKey__ `Number|Undefined` keyboard key to switch WebView window
     *                   between full-screen and non-full-screen modes,
     *                   for GTK+ backend see keys mapping: https://gitlab.gnome.org/GNOME/gtk/raw/master/gdk/gdkkeysyms.h ,
     *                   default value: `F11`
     *  - __closeKey__ `Number|Undefined` keyboard key to close the WebView window
     *                   for GTK+ backend see keys mapping: https://gitlab.gnome.org/GNOME/gtk/raw/master/gdk/gdkkeysyms.h ,
     *                   default value: `Escape`
     *  - __windowWidth__ `Number|Undefined` window width in pixels, default value: `640`
     *  - __windowHeight__ `Number|Undefined` window height in pixels, default value: `480`
     *  - __consoleToStdout__ `Boolean|Undefined` redirect `console.log()` messages to STDOUT,
     *                        default value: `false`
     */
    function run(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            wiltoncall("kiosk_run", opts);
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return {
        run: run
    };
});
