/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["assert", "wilton/utils"], function(assert, utils) {
    "use strict";

    print("test: wilton/utils");
    var fun = function(foo) {
        return foo;
    }; 
    var obj = {
        foo: "bar",
        baz: 42
    };
    
    // undefinedOrNull
    assert(utils.undefinedOrNull(null));
    assert(!utils.undefinedOrNull(utils));

    // startsWith
    assert(utils.startsWith("foo", "fo"));
    assert(!utils.startsWith("foo", "ba"));

    // endsWith
    assert(utils.endsWith("foo", "oo"));
    assert(!utils.endsWith("foo", "ar"));

    // defaultObject
    assert.deepEqual(utils.defaultObject(null), {});
    assert.deepEqual(utils.defaultObject("foo"), {});
    assert.deepEqual(utils.defaultObject(obj), obj);
    assert.strictEqual(utils.defaultObject(obj), obj);

    // defaultString
    assert.equal(utils.defaultString(null), "");
    assert.equal(utils.defaultString(fun), String(fun));

    // defaultJson
    assert.equal(utils.defaultJson(null), "{}");
    assert.equal(utils.defaultJson("foo"), "foo");
    assert.equal(utils.defaultJson(obj), JSON.stringify(obj, null, 4));

    // listProperties
    assert.deepEqual(utils.listProperties(obj), ["foo", "baz"]);

    // checkProperties
    utils.checkProperties(obj, ["foo", "baz"]);
    assert.throws(function() { utils.checkProperties(null, null); });
    assert.throws(function() { utils.checkProperties(obj, null); });
    assert.throws(function() { utils.checkProperties(obj, ["foo", "fail"]); });

    // hasProperties
    assert(utils.hasProperties(obj, ["foo", "baz"]));
    assert.throws(function() { utils.hasProperties(null, null); });
    assert.throws(function() { utils.hasProperties(obj, null); });
    assert(!utils.hasProperties(obj, ["foo", "fail"]));

    // checkPropertyType
    utils.checkPropertyType(obj, "foo", "string");
    utils.checkPropertyType(obj, "baz", "number");
    assert.throws(function() { utils.checkPropertyType(null, null, null); });
    assert.throws(function() { utils.checkPropertyType("obj", "fail", "string"); });
    assert.throws(function() { utils.checkPropertyType("obj", "foo", "number"); });

    // hasPropertyWithType
    assert(utils.hasPropertyWithType(obj, "foo", "string"));
    assert(utils.hasPropertyWithType(obj, "baz", "number"));
    assert(!utils.hasPropertyWithType("obj", "fail", "string"));
    assert(!utils.hasPropertyWithType("obj", "foo", "number"));

    // clone
    assert.throws(function() { utils.cloneObject(null); });
    assert.throws(function() { utils.cloneObject(""); });
    assert.deepEqual(utils.cloneObject(obj), obj);
});
