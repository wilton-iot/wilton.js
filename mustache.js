/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./utils"], function(wiltoncall, utils) {
    "use strict";

    function render(template, values, callback) {
        try {
            var tp = utils.defaultString(template);
            var vals = utils.defaultObject(values);
            var res = wiltoncall("mustache_render", {
                template: tp,
                values: vals
            });
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e, "");
        }
    };

    function renderFile(templateFile, values, callback) {
        try {
            var tpf = utils.defaultString(templateFile);
            var vals = utils.defaultObject(values);
            var res = wiltoncall("mustache_render_file", {
                file: tpf,
                values: vals
            });
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e, "");
        }
    };

    return {
        render: render,
        renderFile: renderFile
    };
});
