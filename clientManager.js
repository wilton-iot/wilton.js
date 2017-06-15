/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["./HttpClient", "./shared", "./utils"], function(HttpClient, shared, utils) {

    function create(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            utils.checkProperties(opts, ["sharedKey"]);
            var sopts = utils.defaultObject(opts.sessionOptions);
            var res = new HttpClient(sopts);
            shared.listAppend(opts.sharedKey, res.handle);
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    function shutdown(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            utils.checkProperties(opts, ["sharedKey"]);
            var list = shared.remove(opts.sharedKey);
            for (var i = 0; i < list.length; i++) {
                var client = new HttpClient({
                    handle: list[i]
                });
                client.close();
            }
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }

    return {
        create: create,
        shutdown: shutdown
    };
});

