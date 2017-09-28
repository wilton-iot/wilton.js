/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["assert", "wilton/mustache"], function(assert, mustache) {
    "use strict";

    print("test: wilton/mustache");

    var rendered = mustache.render("{{#names}}Hi {{name}}!\n{{/names}}", {
        names: [{name: "Chris"}, {name: "Mark"}, {name: "Scott"}]
    });
    assert.equal(rendered, "Hi Chris!\nHi Mark!\nHi Scott!\n");

});
