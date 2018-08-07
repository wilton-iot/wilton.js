/*
 * Copyright 2017, alex at staticlibs.net
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define([
    "assert",
    "wilton/Channel",
    "wilton/DBConnection",
    "wilton/loader",
    "wilton/misc"
], function(assert, Channel, DBConnection, loader, misc) {
    "use strict";

    print("test: wilton/DBConnection");

    var appdir = misc.wiltonConfig().applicationDirectory;

    var conn = new DBConnection("sqlite://" + appdir + "test.db");
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
    var rsEmpty = conn.queryList("select foo, bar from t1 where foo = :foo or bar = :bar order by bar", {
        foo: "ccc_empty",
        bar: 44
    });
    assert.equal(rsEmpty.length, 0);
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
