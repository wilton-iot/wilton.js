
define([], function() {
    return function(req, doFilter) {
        req.filtered2 = true;
        doFilter(req);
    };
});
