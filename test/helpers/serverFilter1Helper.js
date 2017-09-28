
define([], function() {
    return function(req, doFilter) {
        req.filtered1 = true;
        doFilter(req);
    };
});
