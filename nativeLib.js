/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(function() {
    "use strict";

    // todo: Duktape/JerryScript support
    
    if ("undefined" === typeof(Packages)) {
        console.log("Error: wilton.js requires Nashorn or Rhino JVM environment");
    }
    
    var wiltoncall = Packages.net.wiltonwebtoolkit.WiltonJni.wiltoncall;
    
    function wrapRunnable(callback) {
        return new Packages.java.lang.Runnable({
            run: function() {
                callback();
            }
        });
    }
    
    function wrapCallable(callback) {
        return new Packages.java.util.concurrent.Callable({
            call: function() {
                return callback();
            }
        });
    }
    
    // this will go into native code for non-JVM engines
    var wiltonGateway = new Packages.net.wiltonwebtoolkit.WiltonGateway({
        gatewayCallback: function(callbackModule, requestHandle) {
            // expects that it is sync
            require(["wilton/gateway"], function(gateway) {
                gateway(String(callbackModule), requestHandle);
            });
        }
    });
    
    function printStdout(message) {
        Packages.java.lang.System.out.println(message);
    }

    return {
        wiltoncall: wiltoncall,
        wrapRunnable: wrapRunnable,
        wrapCallable: wrapCallable,
        wiltonGateway: wiltonGateway,
        printStdout: printStdout
    };
});
