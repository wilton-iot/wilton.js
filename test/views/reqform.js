
define(function() {
    "use strict";

    return {
        POST: function(req) {
            var form = req.form();
            req.sendResponse(form);
        }
    };
});
