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

/**
 * @namespace DBConnection
 * 
 * __wilton/DBConnection__ \n
 * Connect to relational databases.
 * 
 * This module allows to work with relational databases.
 * 
 * It implementa a lightweight ORM - object-relational mapping,
 * allows to map JavaScript objects to query parameters and to map
 * query results to JavaScript objects.
 * 
 * [SQLite](https://www.sqlite.org/) and [PostgreSQL](https://www.postgresql.org/)
 * databases are supported out of the box. 
 * 
 * Support for Oracle, MSSQL (through ODBC), MySQL
 * and Firebird can be added in custom builds.
 * 
 * DB connection can be closed manually to release system resource, otherwise
 * it will be closed during the shutdown.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // open connection
 * var conn = new DBConnection("postgresql://host=127.0.0.1 port=5432 dbname=test user=test password=test");
 *
 * // execute DDL
 * conn.execute("create table t1 (foo varchar, bar int)");
 * 
 * // execute DQL
 * var res = conn.query("select foo, bar from t1 where foo = :foo or bar = :bar order by bar", {
 *     foo: "ccc",
 *     bar: 42
 * });
 * 
 * // execute DML in transaction
 * conn.doInTransaction(function() {
 *     conn.execute("insert into t1 values(:foo, :bar)", {
 *         foo: "bbb",
 *         bar: 42
 *     });
 * });
 * 
 * // close connection
 * conn.close();
 * 
 * @endcode
 */

define([
    "module",
    "./dyload",
    "./fs",
    "./Logger",
    "./utils",
    "./wiltoncall"
], function(module, dyload, fs, Logger, utils, wiltoncall) {
    "use strict";
    var logger = new Logger(module.id)

    dyload({
        name: "wilton_db"
    });

    /**
     * @function DBConnection
     * 
     * Open connection to database.
     * 
     * Opens connection to database.
     * 
     * @param url `String` backend-specific connection URL,
     *            postgres example: `postgresql://host=127.0.0.1 port=5432 dbname=test user=test password=test`,
     *            sqlite example: `sqlite://test.db`
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` `DBConnection` instance
     */
    var DBConnection = function(url, callback) {
        try {
            var handleJson = wiltoncall("db_connection_open", url);
            var handleParsed = JSON.parse(handleJson);
            this.handle = handleParsed.connectionHandle;
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    DBConnection.prototype = {
        /**
         * @function execute
         * 
         * Execute DML (`insert` or `update`) or DDL (`create` or `drop`) query
         * 
         * Executes DML (`insert` or `update`) or DDL (`create` or `drop`) query
         * 
         * @param sql `String` SQL query
         * @param params `Object|Undefined` query parameters object
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        execute: function(sql, params, callback) {
            try {
                var sqlstr = utils.defaultString(sql);
                var pars = utils.defaultObject(params);
                wiltoncall("db_connection_execute", {
                    connectionHandle: this.handle,
                    sql: sqlstr,
                    params: pars
                });
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function executeFile
         * 
         * Execute all queries from file.
         * 
         * Queries are parsed from file splitting it by `;` symbols
         * and then executed one by one.
         * 
         * Comment-only lines are ignored;
         * 
         * @param filePath `String` path to SQL file
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Number` number of queries executed
         */
        executeFile: function(filePath, callback) {
            try {
                var contents = fs.readFile(filePath);
                var queries = contents.split(";");
                var commentRegexp = /^\s*--.*$/;
                var trimRegex = /^\s+|\s+$/g;
                var count = 0;
                for (var i = 0; i < queries.length; i++) {
                    var lines = queries[i].split("\n");
                    var flines = [];
                    for (var j = 0; j < lines.length; j++) {
                        var li = lines[j];
                        var trimmed = li.replace(trimRegex, "");
                        if (trimmed.length > 0 && !commentRegexp.test(li)) {
                            flines.push(li);
                        }
                    }
                    if (flines.length > 0) {
                        var query = flines.join("\n").replace(trimRegex, "");
                        this.execute(query, {});
                        count += 1;
                    }
                }
                utils.callOrIgnore(callback, count);
                return count;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },
        
        /**
         * @function queryList
         * 
         * Execute `select` query returning result as a list.
         * 
         * Executes `select` query and returns its result as a list.
         * 
         * @param sql `String` SQL query
         * @param params `Object|Undefined` query parameters object
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Array` list of objects, one object per returned row
         */
        queryList: function(sql, params, callback) {
            try {
                var sqlstr = utils.defaultString(sql);
                var pars = utils.defaultObject(params);
                var json = wiltoncall("db_connection_query", {
                    connectionHandle: this.handle,
                    sql: sqlstr,
                    params: pars
                });
                var res = JSON.parse(json);
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function queryObject
         * 
         * Execute `select` query returning result as an object.
         * 
         * Executes `select` query and returns its result as an object.
         * 
         * Query must return exactly one row, otherwise `Error` will be thrown.
         * 
         * @param sql `String` SQL query
         * @param params `Object|Undefined` query parameters object
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Object` object converted from the single row returned
         */
        queryObject: function(sql, params, callback) {
            try {
                var list = this.queryList(sql, params);
                if (1 !== list.length) {
                    throw new Error("Invalid number of records returned, expected 1 record," +
                            " query: [" + sql + "], params: [" + JSON.stringify(params) + "]," +
                            " number of records: [" + list.length +  "]");
                }
                var res = list[0];
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },
        
        /**
         * @function doInTransaction
         * 
         * Perform a set of DB operations inside the transaction.
         * 
         * Performs a set of DB operations inside the transaction.
         * Trnsaction will be committed on success and rolled back on error.
         * 
         * @param operations `Function` function performing DB operations
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Any` value returned by `operations` function
         */
        doInTransaction: function(operations, callback) {
            try {
                var tranJson = wiltoncall("db_transaction_start", {
                    connectionHandle: this.handle
                });
                var tran = JSON.parse(tranJson);
                var res = null;
                try {
                    res = operations();
                    wiltoncall("db_transaction_commit", {
                        transactionHandle: tran.transactionHandle
                    });
                } catch (e) {
                    wiltoncall("db_transaction_rollback", {
                        transactionHandle: tran.transactionHandle
                    });
                    logger.warn("Transaction rolled back, error: [" + utils.formatError(e) + "]");
                    utils.callOrThrow(callback, e);
                }
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function close
         * 
         * Close database connection.
         * 
         * Closes DB connection releasing system resources.
         * Connections left open will be closed on shutdown.
         * 
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        close: function(callback) {
            try {
                wiltoncall("db_connection_close", {
                    connectionHandle: this.handle
                });
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }
    };

    /**
     * @static loadQueryFile
     * 
     * Load queries froma an SQL file.
     * 
     * Parses a file with SQL queries as `query_name: sql` object.
     * 
     * Each query must start with `/** myQuery STAR/` header.
     * 
     * Lines with comments are preserved, empty lines are ignored.
     * 
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` loaded queries.
     */
    // https://github.com/alexkasko/springjdbc-typed-queries/blob/master/typed-queries-common/src/main/java/com/alexkasko/springjdbc/typedqueries/common/PlainSqlQueriesParser.java
    DBConnection.loadQueryFile = function(path, callback) {
        try {
            var lines = fs.readLines(path);
            var nameRegex = new RegExp("^\\s*/\\*{2}\\s*(.*?)\\s*\\*/\\s*$");
            var trimRegex = /^\s+|\s+$/g;
            var res = {};
            var state = "STARTED";
            var name = null;
            var sql = "";
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var trimmed = line.replace(trimRegex, "");
                if (0 === trimmed.length) continue;
                if ("STARTED" === state) { // search for first query name
                    if (utils.startsWith(trimmed, "--")) continue;
                    var startedMatch = nameRegex.exec(line);
                    if (null === startedMatch || 2 !== startedMatch.length) throw new Error(
                            "Query name not found on start, file: [" + path + "], line: [" + i + "]");
                    name = startedMatch[1];
                    state = "COLLECTING";
                } else if ("COLLECTING" == state) {
                    var nameMatch = nameRegex.exec(line);
                    if (null !== nameMatch && 2 == nameMatch.length) { // next query name found
                        if (0 === sql.length) throw new Error(
                                "No SQL found for query name: [" + name + "], file: [" + path + "], line: [" + i + "]");
                        if (res.hasOwnProperty(name)) throw new Error(
                                "Duplicate SQL query name: [" + name + "], file: [" + path + "], line: [" + i + "]");
                        // save collected sql string
                        res[name] = sql.replace(trimRegex,"");
                        // clean collected sql string
                        sql = "";
                        name = nameMatch[1];
                    } else {
                        sql += line;
                        sql += "\n";
                    }
                } else throw new Error("Invalid state: [" + state + "]");
            }
            // tail
            if (null === name) throw new Error("No queries found, file: [" + path + "]");
            if (res.hasOwnProperty(name)) throw new Error(
                    "Duplicate SQL query name: [" + name + "], file: [" + path + "], line: [" + i + "]");
            res[name] = sql.replace(trimRegex,"");
            utils.callOrIgnore(callback, res);
            return res;
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    }
    
    return DBConnection;
});
