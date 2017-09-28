
define(["wilton/loader"], function(loader) {
    return {
        GET: function(req) {
            var dirpath = loader.findModulePath("wilton/test/views");
            req.sendMustache(dirpath + "/test.mustache", {
                names: [{name: "Chris"}, {name: "Mark"}, {name: "Scott"}]
            });
        }
    };
});
