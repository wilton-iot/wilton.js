/*
 * Copyright 2019, alex at staticlibs.net
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
    "wilton/fs",
    "wilton/KVStore",
    "./_scratchDir"
], function(assert, fs, KVStore, scratchDir) {
    "use strict";

    print("test: wilton/KVStore");

    // non-persistent

    // create
    var st = new KVStore();

    // put and get
    assert.equal(st.get("foo"), null);
    assert.equal(st.put("foo", {val: "bar1"}), null);
    assert.equal(st.put("foo", {val: "bar11"}).val, "bar1");
    assert.equal(st.put("foo", {val: "bar2"}).val, "bar11");
    assert.equal(st.get("foo").val, "bar2");
    //invalid input
    assert.throws(function() { st.put(null, "foo"); });
    assert.throws(function() { st.put("", "foo"); });
    assert.throws(function() { st.put("foo", null); });
    assert.throws(function() { st.put(["foo"], "bar"); });

    // putBatch
    var putBatchRes = st.putBatch({
        "foo": {val: "bar3"},
        "bar": {val: "baz"},
        "boo": ["bee1", "bee2"]
    });
    assert.equal(Object.keys(putBatchRes).length, 1);
    assert(putBatchRes.hasOwnProperty("foo"));
    assert.equal(putBatchRes.foo.val, "bar2");
    assert.equal(st.size(), 3);
    assert.equal(st.get("foo").val, "bar3");
    assert.equal(st.get("boo").length, 2);
    assert.equal(st.get("boo")[0], "bee1");
    assert.equal(st.get("boo")[1], "bee2");
    // invalid input
    assert.throws(function() { st.putBatch(null); });
    assert.throws(function() { st.putBatch("foo"); });
    assert.throws(function() { st.putBatch(["foo"]); });

    // append
    st.append("boo", [null, "bee4"]);
    st.append("boo", []);
    assert.equal(st.get("boo").length, 4);
    assert.equal(st.get("boo")[0], "bee1");
    assert.equal(st.get("boo")[1], "bee2");
    assert.equal(st.get("boo")[2], null);
    assert.equal(st.get("boo")[3], "bee4");
    // invalid input
    assert.throws(function() { st.append("foo", {foo: "bar"}); });
    assert.throws(function() { st.append("foo", null); });

    // getBatch
    var getBatchRes = st.getBatch(["foo", "bar", "fail"]);
    assert("object" === typeof(getBatchRes));
    assert.equal(Object.keys(getBatchRes).length, 2);
    assert.equal(getBatchRes.foo.val, "bar3");
    assert.equal(getBatchRes.bar.val, "baz");
    assert("object" === typeof(st.getBatch([])));
    // invalid input
    assert.throws(function() { st.getBatch(null); });
    assert.throws(function() { st.getBatch("foo"); });
    assert.throws(function() { st.getBatch({foo: "bar"}); });
    assert.throws(function() { st.getBatch(["foo", 42]); });

    // keys
    assert.equal(st.keys().length, 3);
    assert.equal(st.keys()[0], "foo");
    assert.equal(st.keys()[1], "bar");
    assert.equal(st.keys()[2], "boo");

    // entries
    assert("object" === typeof(st.entries()));
    assert.equal(Object.keys(st.entries()).length, 3);
    assert.equal(st.entries().foo.val, "bar3");
    assert.equal(st.entries().bar.val, "baz");
    assert.equal(st.entries().boo.length, 4);

    // remove
    assert(st.remove("foo"));
    assert(!st.remove("fail"));
    assert.equal(st.size(), 2);
    // invalid input
    assert.throws(function() { st.remove(null); });

    // removeBatch
    var removeBatchRes = st.removeBatch(["bar", "boo", "fail"]);
    assert.equal(removeBatchRes.length, 2);
    assert.equal(removeBatchRes[0], "bar");
    assert.equal(removeBatchRes[1], "boo");
    assert.equal(st.size(), 0);

    // clear
    st.put("foo1", []);
    assert.equal(st.clear(), 1);
    assert.equal(st.size(), 0);
    assert.equal(st.clear(), 0);

    // destroy
    st.destroy();
    assert.throws(function() { st.size(); });

    // persistent
    var path = scratchDir + "KVStoreTest.json";

    var stp = new KVStore(path);
    stp.put("foo", {val: "bar"});
    stp.put("baz", ["boo", 42]);
    assert.equal(stp.persist(), 2);
    assert(fs.exists(path));
    var loaded1 = JSON.parse(fs.readFile(path));
    assert.equal(Object.keys(loaded1).length, 2);
    assert.equal(loaded1.foo.val, "bar");
    assert.equal(loaded1.baz.length, 2);

    stp.put("boo", {val: "foo1"});
    stp.destroy();
    var loaded2 = JSON.parse(fs.readFile(path));
    assert.equal(Object.keys(loaded2).length, 3);
    assert.equal(loaded2.foo.val, "bar");
    assert.equal(loaded2.boo.val, "foo1");

    var stp2 = new KVStore(path);
    assert.equal(stp2.size(), 3);
    assert.equal(stp2.get("foo").val, "bar");
    assert.equal(stp2.get("boo").val, "foo1");

    fs.unlink(path);

    // invalid persist
    assert.throws(function() { new KVStore().persist(); });

});
