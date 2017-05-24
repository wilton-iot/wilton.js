/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./wiltoncall", "./utils"], function(wiltoncall, utils) {
    "use strict";

    function render(template, values, options) {
        var opts = utils.defaultObject(options);
        try {
            var tp = utils.defaultString(template);
            var vals = utils.defaultObject(values);
            var res = wiltoncall("mustache_render", {
                template: tp,
                values: vals
            });
            var resstr = String(res);
            utils.callOrIgnore(opts.onSuccess, resstr);
            return resstr;
        } catch (e) {
            utils.callOrThrow(opts.onFailure, e, "");
        }
    };

    function renderFile(templateFile, values, options) {
        var opts = utils.defaultObject(options);
        try {
            var tpf = utils.defaultString(templateFile);
            var vals = utils.defaultObject(values);
            var res = wiltoncall("mustache_render_file", {
                file: tpf,
                values: vals
            });
            var resstr = String(res);
            utils.callOrIgnore(opts.onSuccess, resstr);
            return resstr;
        } catch (e) {
            utils.callOrThrow(opts.onFailure, e, "");
        }
    };

    return {
        render: render,
        renderFile: renderFile
    };
});
