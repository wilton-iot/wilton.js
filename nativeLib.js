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

    return {
        wiltoncall: Packages.net.wiltonwebtoolkit.WiltonJni.wiltoncall
    };
});
