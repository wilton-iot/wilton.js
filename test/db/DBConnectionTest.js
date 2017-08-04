/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["assert", "wilton/db/DBConnection"], function(assert, DBConnection) {
    "use strict";

    var conn = new DBConnection("sqlite://test.db");
//    var conn = new DBConnection("postgresql://host=127.0.0.1 port=5432 dbname=test user=test password=test");

    conn.execute("drop table if exists t1");
    // insert
    conn.execute("create table t1 (foo varchar, bar int)");
    conn.execute("insert into t1 values('aaa', 41)");
    // named params
    conn.execute("insert into t1 values(:foo, :bar)", {
        foo: "bbb",
        bar: 42
    });
    conn.execute("insert into t1 values(:foo, :bar)", ["ccc", 43]);
    // select
    var rs = conn.query("select foo, bar from t1 where foo = :foo or bar = :bar order by bar", {
        foo: "ccc",
        bar: 42
    });
    assert(2 === rs.length);
    assert("bbb" === rs[0].foo);
    assert(42 === rs[0].bar);
    assert("ccc" === rs[1].foo);
    assert(43 === rs[1].bar);
    var el = conn.query("select foo, bar from t1 where foo = :foo or bar = :bar order by bar", {
        foo: "bbb",
        bar: 42
    });
    assert("bbb" === el.foo);
    assert(42 === el.bar);

    conn.doInTransaction(function() {/* some db actions */});

});
