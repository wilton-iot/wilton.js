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
    "wilton/PGConnection",
    "wilton/loader",
    "moment"
], function(assert, PGConnection, loader, moment) {
    "use strict";

    print("test: wilton/PGconnection");

    var conn = new PGConnection("postgresql://host=127.0.0.1 port=5432 dbname=test user=test password=test");

    conn.execute("drop table if exists t1");
    // insert
    conn.execute("create table t1 (foo varchar, bar int)");
    var res = conn.execute("insert into t1 values('aaa', 41)");
    assert.equal(res.cmd, "INSERT");
    assert.strictEqual(res.count, 1);

    // named params
    res = conn.execute("insert into t1 values(:foo, :bar)", {
        foo: "bbb",
        bar: 42
    });
    assert.equal(res.cmd, "INSERT");
    assert.strictEqual(res.count, 1);

    res = conn.execute('update t1 set foo = $1 where bar = $2', [ 'bbb22', 42 ]);
    assert.equal(res.cmd, "UPDATE");
    assert.strictEqual(res.count, 1);

    res = conn.execute('update t1 set foo = $1 where bar = $2', [ 'bbb22', 77 ]);
    assert.equal(res.cmd, "UPDATE");
    assert.strictEqual(res.count, 0);

    conn.execute("insert into t1 values(:foo, :bar)", ["ccc", 43]);
    // select
    var rs = conn.queryList("select foo, bar from t1 where foo = :foo or bar = :bar order by bar", {
        foo: "ccc",
        bar: 42
    });
    assert.equal(rs.length, 2);
    assert.equal(rs[0].foo, "bbb22");
    assert.equal(rs[0].bar, 42);
    assert.equal(rs[1].foo, "ccc");
    assert.equal(rs[1].bar, 43);
    var el = conn.queryObject("select foo, bar from t1 where foo = :foo or bar = :bar order by bar", {
        foo: "bbb",
        bar: 42
    });
    assert.equal(el.foo, "bbb22");
    assert.equal(el.bar, 42);

    res = conn.execute('delete from t1 where foo = $1', [ 'bbb' ]);
    assert.equal(res.cmd, "DELETE");
    assert.strictEqual(res.count, 0);

    res = conn.execute('delete from t1 where foo = $1', [ 'bbb22' ]);
    assert.equal(res.cmd, "DELETE");
    assert.strictEqual(res.count, 1);

    var testObj = { jkl: 123, bb: 22 };
    conn.execute('insert into t1 values($1, $2)', [ JSON.stringify(testObj), 99 ]);

    res = conn.queryObject('select * from t1 where $1 = bar', [ 99 ]);
    assert.strictEqual(res.foo, JSON.stringify(testObj));

    conn.execute('delete from t1 where $1 = bar', [ 99 ]);

    assert.equal(conn.doInTransaction(function() { return 42; }), 42);

    // loadQueryFile PREPARED_STATEMENTS
    var queries = PGConnection.loadQueryFile(loader.findModulePath("wilton/test/data/pgtest.sql"));
    conn.execute(queries.insertT1, [ 'ggg', 55 ]);

    var res = conn.queryList(queries.selectT1, { bar: 41 });
    assert(Array.isArray(res));
    assert.equal(res.length, 2);
    assert.deepEqual(res[0], { foo: 'ccc', bar: 43 });
    assert.deepEqual(res[1], { foo: 'ggg', bar: 55 });

    assert.throws(function() { conn.execute(queries.undefined) }, /Empty sql query./);
    assert.throws(function() { conn.queryList(queries.undefined) }, /Empty sql query./);
    assert.throws(function() { conn.queryObject(queries.undefined) }, /Empty sql query./);


    /// Specific types
    conn.execute("drop table if exists t2");
    conn.execute("create table if not exists t2 (id serial primary key,b bool, arr int[],js json);");

    var insertT2Query = 'insert into t2 values (DEFAULT, $3, $2, $1);';
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

    res = conn.queryList('select * from t2');
    assert(Array.isArray(res));
    assert.equal(res.length, 2);
    assert.strictEqual(res[0].b, false);
    assert.deepEqual(res[0].arr, [ 3, 2, 1, 0 ]);
    assert.deepEqual(res[0].js, { test: 1, sec: 3 });
    assert.strictEqual(res[1].b, true);
    assert.deepEqual(res[1].arr, [ 1, 2, 3 ]);
    assert.deepEqual(res[1].js, { a: 1, b: { c: 2 } });

    conn.execute(insertT2Query, [ null, null, null ]);
    res = conn.queryList('select * from t2 where b is null');
    assert(Array.isArray(res));
    assert.equal(res.length, 1);
    assert.deepEqual(res[0], { id: 3, b: null, arr: null, js: null });

    res = conn.queryList("select js -> 'b' as eval from t2;");
    assert(Array.isArray(res));
    assert.equal(res.length, 3);
    assert.deepEqual(res[0], { eval: null });
    assert.deepEqual(res[1], { eval: { c: 2 } });
    assert.deepEqual(res[2], { eval: null });

    /// Float
    conn.execute('drop table if exists t3');
    conn.execute('create table if not exists t3 (id serial primary key, dec decimal, num numeric, real real)');

    var floats = {
        id: 1,
        dec: 0.000157,
        num: 0.000333,
        real: 0.000789
    };
    conn.execute('insert into t3 values(default, :dec, :num, :real)', floats);
    res = conn.queryObject('select * from t3');
    assert.deepEqual(res, floats);


    /// Timestamps
    conn.execute('drop table if exists t4;');
    conn.execute('create table if not exists t4 (id int, date timestamp (0) with time zone)');

    var date1 = new Date();
    conn.execute('insert into t4 values(:id, :date)', [ 22, date1 ]);

    res = conn.queryList('select * from t4');

    var date2 = new moment(res[0].date);
    assert.equal(Math.round(date1 / 1000), Math.round(date2 / 1000));


    function trim(str) { return str.trim(); }
    /// Strings
    conn.execute("drop table if exists t5");
    conn.execute("create table if not exists t5 (id serial primary key, chrs char(16)[], vchrs varchar(16)[], texts text[], str varchar(16));");
    var insertT5Query = 'insert into t5 values (DEFAULT, $1, $2, $3, $4);';
    conn.execute(insertT5Query, [ [ 'one', 'two', 'three' ], [ 'thr', 'tw', 'on' ], [ 'abc', 'qwe' ], 'helloWorld' ]);
    conn.execute(insertT5Query, { $1: [], $2: [], $3: [], $4: '' });
    res = conn.queryList('select * from t5');
    assert(Array.isArray(res));
    assert.equal(res.length, 2);
    assert.deepEqual(res[0].id, 1);
    assert.deepEqual(res[0].chrs.map(trim), [ 'one', 'two', 'three' ]);
    assert.deepEqual(res[0].vchrs, [ 'thr', 'tw', 'on' ]);
    assert.deepEqual(res[0].texts, [ 'abc', 'qwe' ]);
    assert.deepEqual(res[0].str, 'helloWorld');
    assert.deepEqual(res[1], { id: 2, chrs: [], vchrs: [], texts: [], str: '' });


    /// ENUMs
    conn.execute("drop table if exists t6");
    conn.execute("drop type if exists mood");
    conn.execute("CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy')");
    conn.execute("create table if not exists t6 (id serial, cm mood)");
    var insertT6Query = 'insert into t6 values (DEFAULT, $1);';
    conn.execute(insertT6Query, [ 'ok' ]);
    conn.execute(insertT6Query, [ 'sad' ]);
    conn.execute(insertT6Query, [ 'happy' ]);
    assert.throws(function() { conn.execute(insertT6Query, [ 'unknown' ]); }, /PQexecPrepared error Fatal error. ОШИБКА:  неверное значение для перечисления/);
    assert.throws(function() { conn.execute("update t6 set cm=$1 where id=$2", [ 'unknown', 2 ]); }, /PQexecPrepared error Fatal error. ОШИБКА:  неверное значение для перечисления/);
    res = conn.queryList('select * from t6');
    assert(Array.isArray(res));
    assert.equal(res.length, 3);
    assert.deepEqual(res[0], { id: 1, cm: 'ok' });
    assert.deepEqual(res[1], { id: 2, cm: 'sad' });
    assert.deepEqual(res[2], { id: 3, cm: 'happy' });
});
