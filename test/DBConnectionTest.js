/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "assert",
    "wilton/Channel",
    "wilton/DBConnection",
    "wilton/loader"
], function(assert, Channel, DBConnection, loader) {
    "use strict";

    print("test: wilton/DBConnection");

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
    var rs = conn.queryList("select foo, bar from t1 where foo = :foo or bar = :bar order by bar", {
        foo: "ccc",
        bar: 42
    });
    assert.equal(rs.length, 2);
    assert.equal(rs[0].foo, "bbb");
    assert.equal(rs[0].bar, 42);
    assert.equal(rs[1].foo, "ccc");
    assert.equal(rs[1].bar, 43);
    var el = conn.queryObject("select foo, bar from t1 where foo = :foo or bar = :bar order by bar", {
        foo: "bbb",
        bar: 42
    });
    assert.equal(el.foo, "bbb");
    assert.equal(el.bar, 42);

    assert.throws(function() { conn.query("select foo, bar from t1 where foo = 'fail'"); });
    assert.throws(function() { conn.query("select foo, bar from t1"); });

    assert.equal(conn.doInTransaction(function() { return 42; }), 42);
    var lock = new Channel("DBConnectionTest.lock", 1);
    assert.equal(conn.doInSyncTransaction("DBConnectionTest.lock", function() { return 42; }), 42);
    lock.close();

    // loadQueryFile
    var queries = DBConnection.loadQueryFile(loader.findModulePath("wilton/test/data/test.sql"));
    assert.equal(queries.myTestSelect, "select foo from bar\n    where baz = 1\n    and 1 > 0 -- stupid condidion\n    limit 42");
    assert.equal(queries.myTestSelect2, "-- slow query\ndelete from foo\n    where baz = 1");
    assert.equal(queries.myTestSelect3, "drop table foo");
});
