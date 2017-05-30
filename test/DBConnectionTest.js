/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["wilton/DBConnection", "./_testUtils"], function(DBConnection, testUtils) {
    "use strict";

    var conn = new DBConnection({
        url: "sqlite://test.db"
    });
    conn.execute("drop table if exists t1", {});
    // insert
    conn.execute("create table t1 (foo varchar, bar int)", {});
    conn.execute("insert into t1 values('aaa', 41)", {});
    // named params
    conn.execute("insert into t1 values(:foo, :bar)", {
        foo: "bbb",
        bar: 42
    });
    conn.execute("insert into t1 values(?, ?)", ["ccc", 43]);
    // select
    var rs = conn.query("select foo, bar from t1 where foo = :foo or bar = :bar order by bar", {
        foo: "ccc",
        bar: 42
    });
    testUtils.assert(2 === rs.length);
    testUtils.assert("bbb" === rs[0].foo);
    testUtils.assert(42 === rs[0].bar);
    testUtils.assert("ccc" === rs[1].foo);
    testUtils.assert(43 === rs[1].bar);
    var el = conn.query("select foo, bar from t1 where foo = :foo or bar = :bar order by bar", {
        foo: "bbb",
        bar: 42
    });
    testUtils.assert("bbb" === el.foo);
    testUtils.assert(42 === el.bar);

    conn.doInTransaction(function() {/* some db actions */});

    conn.close();

});
