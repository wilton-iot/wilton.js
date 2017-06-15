/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["wilton/shared", "wilton/utils", "./Connection"], function(shared, utils, Connection) {
    
    function open(options, callback) {
        var opts = utils.defaultObject(options);
        try {
            utils.checkProperties(opts, ["sharedKey", "url"]);
            var res = new Connection(opts.url);
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
                var conn = new Connection({
                    handle: list[i]
                });
                conn.close();
            }
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    return {
        open: open,
        shutdown: shutdown
    };
});

