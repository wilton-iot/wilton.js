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
     */
    function run(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            if (misc.isLinux()) {
                wiltoncall("kiosk_run", opts);
            } else if (misc.isWindows()) {
                var Runnable = Packages.java.lang.Runnable;
                var SimpleStringProperty = Packages.javafx.beans.property.SimpleStringProperty;
                var Image = Packages.javafx.scene.image.Image;
                var Scene = Packages.javafx.scene.Scene;
                var Platform = Packages.javafx.application.Platform;
                var WebView = Packages.javafx.scene.web.WebView;
                var FxApp = Packages.wilton.support.fx.FxApp;

                utils.checkPropertyType(opts, "url", "string");

                FxApp.launchApp(new Runnable({run: function() {
                    var stage = FxApp.STAGE;
                    var webView = new WebView();
                    webView.getEngine().load(opts.url);
                    var scene = new Scene(webView);
                    stage.setScene(scene);
                    var titleProp = new SimpleStringProperty("wilton");
                    stage.getIcons().add(new Image("file:" + misc.wiltonConfig().wiltonHome + "conf/logo.png"));
                    stage.titleProperty().bind(titleProp);
                    stage.setFullScreen(true === opts.fullscreen);
                    stage.setWidth("number" === typeof(opts.windowWidth) ? opts.windowWidth : 640);
                    stage.setHeight("number" === typeof(opts.windowHeight) ? opts.windowHeight : 480);
                    stage.show();
                }}));
                Platform.exit();
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
