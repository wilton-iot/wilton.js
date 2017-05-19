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
    
    var wiltoncall = function(name, data) {
        var res = Packages.net.wiltonwebtoolkit.WiltonJni.wiltoncall(name, data);
        return null != res ? String(res) : null;
    }
    
    function printStdout(message) {
        Packages.java.lang.System.out.println(message);
    }

    return {
        wiltoncall: wiltoncall,
        printStdout: printStdout
    };
});
