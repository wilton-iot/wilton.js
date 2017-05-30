/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["wilton/mustache", "./_testUtils"], function(mustache, testUtils) {
    "use strict";

    var rendered = mustache.render("{{#names}}Hi {{name}}!\n{{/names}}", {
        names: [{name: "Chris"}, {name: "Mark"}, {name: "Scott"}]
    });
    testUtils.assert("Hi Chris!\nHi Mark!\nHi Scott!\n" === rendered);

});
