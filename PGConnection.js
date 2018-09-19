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
 * @namespace PGConnection
 *
 * __wilton/PGConnection__ \n
 * Connect to PostgreSQL database.
 * 
 * This module allows to work with PostgreSQL database.
 * 
 * It implements a lightweight ORM - object-relational mapping,
 * allows to map JavaScript objects to query parameters and to map
 * query results to JavaScript objects.
 * 
 * Postgres connection can be closed manually to release system resource, otherwise
 * it will be closed during the shutdown.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // open connection
 * var conn = new PGConnection("postgresql://host=127.0.0.1 port=5432 dbname=test user=test password=test");
 *
 * // execute DDL
 * conn.execute("create table t1 (foo varchar, bar int)");
 * 
 * // execute DQL
 * var res = conn.queryList("select foo, bar from t1 where foo = :foo or bar = :bar order by bar", {
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
    "./wiltoncall",
    "./DBConnection"
], function(module, dyload, fs, Logger, utils, wiltoncall, DBConnection) {
    "use strict";
    var logger = new Logger(module.id)

    dyload({
        name: "wilton_db"
    });

    /**
     * @function PGConnection
     * 
     * Open connection to database.
     * 
     * Opens connection to database.
     * 
     * @param url `String` backend-specific connection URL,
     *            example: `postgresql://host=127.0.0.1 port=5432 dbname=test user=test password=test`,
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` `pgsql` instance
     */
    var PGConnection = function(_url, callback) {
        var PREFIX = 'postgresql://';

        try {
            var url = utils.startsWith(_url, PREFIX) ? _url.slice(PREFIX.length) : _url;

            var handleJson = wiltoncall("db_pgsql_connection_open", {
                parameters: url
            });
            var handleParsed = JSON.parse(handleJson);
            this.handle = handleParsed.connectionHandle;
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    PGConnection.prototype = {
        /**
         * @function execute
         * 
         * Execute specified SQL query
         *
         * @param sql `String` SQL query
         * @param params `Object|Undefined` query parameters object
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Object|Object[]`
         */
        execute: function(sql, params, callback) {
            try {
                var sqlstr = utils.defaultString(sql);
                if (!sqlstr) {
                    throw new Error('Empty sql query.');
                }

                var pars = utils.defaultObject(params);
                var json = wiltoncall("db_pgsql_connection_execute_sql", {
                    connectionHandle: this.handle,
                    sql: sqlstr,
                    params: pars
                });
                var res = JSON.parse(json);

                if (res.cmd_status) {
                    var status = res.cmd_status.split(' ');
                    res.cmd = status[0];

                    if (status.length === 3) {
                        res.oid = parseInt(status[1]);
                        res.count = parseInt(status[2]);
                    } else {
                        res.count = parseInt(status[1]);
                    }
                }

                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function executeFile
         * 
         * Execute all queries from file.
         * 
         * Queries are parsed from file splitting it by `;` or `;;` symbols
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
                var queries = contents.indexOf(';;') !== -1 ? contents.split(';;') : contents.split(';');
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
                var res = this.execute(sql, params);
                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function queryObject
         * 
         * Execute `select` query returning single row result as an object or null on empty query.
         * 
         * Executes `select` query and returns its single row result as an object or null on empty query.
         * 
         * Query must return only one row or be empty, otherwise `Error` will be thrown.
         * 
         * @param sql `String` SQL query
         * @param params `Object|Undefined` query parameters object
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Object|null` object converted from the single row or null returned
         */
        queryObject: function(sql, params, callback) {
            try {
                var list = this.queryList(sql, params);
                if (list.length > 1) {
                    throw new Error("Invalid number of records returned, expected no more than 1 record," +
                            " query: [" + sql + "], params: [" + JSON.stringify(params) + "]," +
                            " number of records: [" + list.length +  "]");
                }

                var res = list[0] || null;
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
                wiltoncall("db_pgsql_transaction_begin", {
                    connectionHandle: this.handle
                });
                var res = null;
                try {
                    res = operations();
                    wiltoncall("db_pgsql_transaction_commit", {
                        connectionHandle: this.handle
                    });
                } catch (e) {
                    wiltoncall("db_pgsql_transaction_rollback", {
                        connectionHandle: this.handle
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
                wiltoncall("db_pgsql_connection_close", {
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
     * @param path `String` path to file with data
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` loaded queries.
     */
    // https://github.com/alexkasko/springjdbc-typed-queries/blob/master/typed-queries-common/src/main/java/com/alexkasko/springjdbc/typedqueries/common/PlainSqlQueriesParser.java
    PGConnection.loadQueryFile = DBConnection.loadQueryFile;


    return PGConnection;
});
