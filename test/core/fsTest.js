/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["assert", "wilton/fs", "wilton/utils"], function(assert, fs, utils) {
    "use strict";

    // mkdir
    fs.mkdir("fstest");

    // appendFile
    var tf = "fstest/appendFile_test.txt";
    
    // writeFile
    fs.writeFile(tf, "foo");
    fs.appendFile(tf, "bar");
    
    // readFile
    assert("foobar" === fs.readFile(tf));
    
    // exists
    assert(true === fs.exists("fstest"));
    assert(true === fs.exists(tf));
    
    // readdir
    assert("appendFile_test.txt" === fs.readdir("fstest")[0]);
    
    // stat
    var sdir = fs.stat("fstest");
    assert(false === sdir.isFile);
    assert(true === sdir.isDirectory);
    var sfile = fs.stat(tf);
    assert(true === sfile.isFile);
    assert(false === sfile.isDirectory);
    
    // copy
    var tfCopied = "fstest/appendFile_test_copied.txt";
    fs.copyFile(tf, tfCopied);
    assert(true === fs.exists(tf));
    assert(true === fs.exists(tfCopied));
    assert("foobar" === fs.readFile(tfCopied));
    fs.unlink(tfCopied);
    assert(false === fs.exists(tfCopied));
    
    // rename
    var tfMoved = "fstest/appendFile_test_moved.txt";
    fs.rename(tf, tfMoved);
    assert(false === fs.exists(tf));
    assert(true === fs.exists(tfMoved));
    
    // unlink
    fs.unlink(tfMoved);
    assert(false === fs.exists(tfMoved));
    
    // rmdir
    fs.rmdir("fstest");
    assert(false === fs.exists("fstest"));

});
