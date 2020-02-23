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
 * Uses WebKitGTK backend on Linux and OpenJFX on Windows (requires `rhino` or `nashorn` engine).
 * 
 * Usage example:
 * 
 * @code
 * 
 * // open URL in a non-fullscreen window
 * kiosk.run({
 *     url: "http://localhost:8080",
 *     fullscreen: false,
 *     windowWidth: 800,
 *     windowHeight: 600
 * });
 * 
 * @endcode
 * 
 * Example of calling JS script in Wilton context (with full access to Wilton API),
 * `enableWiltonCalls` option must be set:
 * 
 * @code
 * 
 * var callDesc = JSON.stringify({
 *     module: "my/mod1",
 *     func: "mufun1",
 *     args: ["foo", 42]
 * });
 * 
 * // on Linux, no result available
 * window.webkit.messageHandlers.wilton.postMessage(callDesc);
 * 
 * // on Windows
 * var res = window.wilton.callWiltonModule(callDesc);
 * 
 * @endcode
 */
define([
    "./dyload",
    "./misc",
    "./wiltoncall",
    "./utils"
], function(dyload, misc, wiltoncall, utils) {
    "use strict";

    if (misc.isLinux()) {
        dyload({
            name: "wilton_kiosk"
        });
    }

    function runFx(opts) {
        var Runnable = Packages.java.lang.Runnable;
        var SimpleStringProperty = Packages.javafx.beans.property.SimpleStringProperty;
        var Image = Packages.javafx.scene.image.Image;
        var Scene = Packages.javafx.scene.Scene;
        var Platform = Packages.javafx.application.Platform;
        var WebView = Packages.javafx.scene.web.WebView;
        var FxApp = Packages.wilton.support.fx.FxApp;
        var WiltonWebViewBridge = Packages.wilton.support.webview.WiltonWebViewBridge;

        utils.checkPropertyType(opts, "url", "string");

        FxApp.launchApp(new Runnable({run: function() {
            var stage = FxApp.STAGE;
            var wv = new WebView();
            var engine = wv.getEngine();
            var bridge = new WiltonWebViewBridge();
            if (true === opts.enableWiltonCalls) {
                var window = engine.executeScript("window");
                window.setMember("wilton", bridge);
            }
            engine.load(opts.url);
            var scene = new Scene(wv);
            stage.setScene(scene);
            var titleProp = new SimpleStringProperty("string" === typeof(opts.windowTitle) ? opts.windowTitle: "wilton");
            stage.titleProperty().bind(titleProp);
            var iconPath = "string" === typeof(opts.windowIconPath) ? opts.windowIconPath:
                    misc.wiltonConfig().wiltonHome + "conf/logo.png";
            stage.getIcons().add(new Image("file:" + iconPath));
            stage.setFullScreen(true === opts.fullscreen);
            stage.setWidth("number" === typeof(opts.windowWidth) ? opts.windowWidth : 640);
            stage.setHeight("number" === typeof(opts.windowHeight) ? opts.windowHeight : 480);
            if ("function" === typeof(opts.fxStageCallback)) {
                opts.fxStageCallback(stage);
            } else {
                stage.show();
            }
        }}));
        Platform.exit();
    }

    /**
     * @function run
     * 
     * Open and run a WebView window in a current thread
     * 
     * Opens a WebView window with a specified URL to load.
     * 
     * Current thread remains blocked until WebView window is closed.
     * 
     * Note: on Linux it is better to run kiosk on `duktape` JS engine,
     * on Windows `rhino` or `nashorn` JS engine must be used because
     * on Windows kiosk relies on OpenJFX.
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
     *                   default value on Linux: `F11`; non-configurable on Windows, default value: `Esc`
     *  - __closeKey__ `Number|Undefined` keyboard key to close the WebView window
     *                   for GTK+ backend see keys mapping: https://gitlab.gnome.org/GNOME/gtk/raw/master/gdk/gdkkeysyms.h ,
     *                   default value: `Escape`; not supported on Windows
     *  - __windowWidth__ `Number|Undefined` window width in pixels, default value: `640`
     *  - __windowHeight__ `Number|Undefined` window height in pixels, default value: `480`
     *  - __consoleToStdout__ `Boolean|Undefined` redirect `console.log()` messages to STDOUT,
     *                        default value: `false`; not supported on Windows
     *  - __inspectorMode__ `Boolean|Undefined` enable WebView code inspector,
     *                      default value: `false`; not supported on Windows
     *  - __enableWiltonCalls__ `Boolean|Undefined` allow to call native code through `wiltoncall` API,
     *                          default value: `false`
     *  - __windowTitle__ `String|Undefined` title of the WebView window, default value: `wilton`
     *  - __windowIconPath__ `String|Undefined` path to the `PNG` file to use as a WebView window icon,
     *                          default value: wilton icon; not supported on Linux
     *  - __fxStageCallback__ `String|Undefined` path to the `PNG` file to use as a WebView window icon,
     *                          default value: `function(stage) { stage.show(); }`
     */
    function run(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            if (misc.isLinux()) {
                wiltoncall("kiosk_run", opts);
            } else if (misc.isWindows()) {
                runFx(opts);
            } else {
                throw new Error("Unsupported OS");
            }
            return utils.callOrIgnore(callback);
        } catch (e) {
            return utils.callOrThrow(callback, e);
        }
    }

    return {
        run: run
    };
});
