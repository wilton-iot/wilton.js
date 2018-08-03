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
    "wilton/pgsql",
    "wilton/loader",
    "wilton/misc"
], function(assert, Channel, pgsql, loader, misc) {
    "use strict";

    print("test: wilton/pgsql");

    var appdir = misc.wiltonConfig().applicationDirectory;

    var conn = new pgsql("postgresql://host=127.0.0.1 port=5432 dbname=test user=test password=test");

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

    assert.equal(conn.doInTransaction(function() { return 42; }), 42);
    var lock = new Channel("DBConnectionTest.lock", 1);
    assert.equal(conn.doInSyncTransaction("DBConnectionTest.lock", function() { return 42; }), 42);
    lock.close();

    // loadQueryFile
    var queries = pgsql.loadQueryFile(loader.findModulePath("wilton/test/data/test.sql"));
    assert.equal(queries.myTestSelect, "select foo from bar\n    where baz = 1\n    and 1 > 0 -- stupid condidion\n    limit 42");
    assert.equal(queries.myTestSelect2, "-- slow query\ndelete from foo\n    where baz = 1");
    assert.equal(queries.myTestSelect3, "drop table foo");


    /// Specific types
    conn.execute("drop table if exists t2");
    conn.execute("create table if not exists t2 (id serial primary key,b bool, arr int[],js json);");

    const insertT2Query = 'insert into t2 values (DEFAULT, $3, $2, $1);';
    conn.execute(insertT2Query, {
        $3: false,
        $2: [ 3, 2, 1, 0 ],
        $1: { test: 1, sec: 3 }
    });
    conn.execute(insertT2Query, [
        { a: 1, b: { c: 2 } },
        [ 1, 2, 3 ],
        true
    ]);

    var res = conn.queryList('select * from t2');
    assert(Array.isArray(res));
    assert.equal(res.length, 2);
    assert.strictEqual(res[0].b, false);
    assert.deepEqual(res[0].arr, [ 3, 2, 1, 0 ]);
    assert.deepEqual(res[0].js, { test: 1, sec: 3 });
    assert.strictEqual(res[1].b, true);
    assert.deepEqual(res[1].arr, [ 1, 2, 3 ]);
    assert.deepEqual(res[1].js, { a: 1, b: { c: 2 } });

    conn.execute('insert into t2 values (DEFAULT, null, null, null);');
    ///conn.execute(insertT2Query, [ null, null, null ]);    /// TODO fixme

    conn.queryList('select * from t2');


    //conn.execute(insertT2Query, [ {}, [], null ]);
    ///var res = conn.queryList("select js -> 'b' as eval from t2;");
    /*var res = conn.queryList("select * from t2;");

    console.log('RES:::');
    console.log(JSON.stringify(res, null, 4));*/
});
