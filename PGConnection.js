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
 * @namespace pgsql
 * 
 * __wilton/PGconnection__ \n
 * Connect to PostgreSQL database.
 * 
 * This module allows to work with PostgreSQL database.
 * 
 * It implements a lightweight ORM - object-relational mapping,
 * allows to map JavaScript objects to query parameters and to map
 * query results to JavaScript objects.
 * 
 * DB connection can be closed manually to release system resource, otherwise
 * it will be closed during the shutdown.
 * 
 * Usage example:
 * 
 * @code
 * 
 * // open connection
 * var conn = new PGconnection("postgresql://host=127.0.0.1 port=5432 dbname=test user=test password=test");
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
 * // prepared statements
 * var queriesPath = loader.findModulePath(module.id + ".sql");
 * var statements = conn.loadAndPrepareStatements(module.id, queriesPath);
 *
 * statements.execute('insert', [ 'one', 'two' ]);
 * var res = statements.queryList('select', [ 'three' ]);
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
     * @function PGconnection
     * 
     * Open connection to database.
     * 
     * Opens connection to database.
     * 
     * @param url `String` backend-specific connection URL,
     *            postgres example: `postgresql://host=127.0.0.1 port=5432 dbname=test user=test password=test`,
     * @param callback `Function|Undefined` callback to receive result or error
     * @return `Object` `pgsql` instance
     */
    var PGconnection = function(_url, callback) {
        var PREFIX = 'postgresql://';

        try {
            var url = utils.startsWith(_url, PREFIX) ? _url.slice(PREFIX.length) : _url;

            var handleJson = wiltoncall("db_pgsql_connection_open", {
                parameters: url,
                ping_on: true
            });
            var handleParsed = JSON.parse(handleJson);
            this.handle = handleParsed.connectionHandle;
            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    PGconnection.prototype = {
        /**
         * @function execute
         * 
         * Execute specified SQL query
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
                wiltoncall("db_pgsql_connection_execute_sql_with_parameters", {
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
                var json = wiltoncall("db_pgsql_connection_execute_sql_with_parameters", {
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
         * @return `Object|null` object converted from the single row returned
         */
        queryObject: function(sql, params, callback) {
            try {
                var list = this.queryList(sql, params);
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
         * @function doInSyncTransaction
         * 
         * Perform a set of DB operations inside the synchronized transaction.
         * 
         * This method runs specified operations inside the transaactional
         * block (using `doInTransaction`) additionally wrapping it with
         * synchroinized block (using `Channel.synchronize()`).
         * 
         * @param lockChannelName `String` name of the channel to use for synchronization
         *                        it must be existing empty channel with `maxSize` = `1`
         * @param operations `Function` function performing DB operations
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Any` value returned by `operations` function
         */
        doInSyncTransaction: function(lockChannelName, operations, callback) {
            try {
                var Channel = WILTON_requiresync("wilton/Channel");
                var lock = Channel.lookup(lockChannelName);
                var self = this;
                var res = lock.synchronize(function() {
                    return self.doInTransaction(operations);
                });
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
        },

        /**
         * @function prepareStatement
         *
         * Prepare a statement for execution.
         *
         * Prepares a statement for execution.
         *
         * @param name `String` Name of prepared statement
         * @param sql `String` SQL query
         * @param callback `Function|Undefined` callback to receive result or error
         * @return `Undefined`
         */
        prepareStatement: function(name, sql, callback) {
            try {
                if (name.length > 63) {
                    throw new Error('Prepared statement name will be truncated to 63 chars maximum. [' + name + ']');
                }

                wiltoncall('db_pgsql_connection_prepare', {
                    connectionHandle: this.handle,
                    name: name,
                    sql: sql
                });

                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function deallocate
         *
         * Deallocate a prepared statement.
         *
         * Deallocate a prepared statement.
         *
         * @param name `String` Name of prepared statement
         * @param callback `Function|Undefined` callback to receive result or error
         */
        deallocate: function(name, callback) {
            try {
                wiltoncall('db_pgsql_connection_deallocate_prepared', {
                    connectionHandle: this.handle,
                    name: name
                });

                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function getPreparedStatementInfo
         *
         * Get information about a prepared statement.
         *
         * Get information about a prepared statement's parameters types.
         *
         * @param name `String` Name of prepared statement
         * @param callback `Function|Undefined` callback to receive result or error
         * @returns {*}
         */
        getPreparedStatementInfo: function(name, callback) {
            try {
                var res = wiltoncall('db_pgsql_connection_get_prepare_info', {
                    connectionHandle: this.handle,
                    name: name
                });

                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function executePreparedStatement
         *
         * Execute a prepared statement.
         *
         * Executes a prepared statement query.
         *
         * @param name `String` Name of prepared statement
         * @param _params `Object|Undefined` query parameters object
         * @param callback `Function|Undefined` callback to receive result or error
         * @returns {*}
         */
        executePreparedStatement: function(name, _params, callback) {
            try {
                var params = utils.defaultObject(_params);
                var res = wiltoncall('db_pgsql_connection_execute_prepared_with_parameters', {
                    connectionHandle: this.handle,
                    name: name,
                    params: params
                });

                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                if (e.message.split('\n')[0].match(/prepared statement ".*" does not exist/)) {
                    e = new Error('Undefined prepared statement');
                }

                utils.callOrThrow(callback, e);
            }
        },

        /**
         * @function loadAndPrepareStatements
         *
         * Load and prepare queries from SQL file.
         *
         * Parses a file with SQL queries as `query_name: sql` object.
         *
         * Each query must start with `/** myQuery STAR/` header.
         *
         * Lines with comments are preserved, empty lines are ignored.
         *
         * @param moduleId `String` unique namespace, uses as prefix of prepared statements names
         * @param path `String` path to file with data
         * @param callback `Function|Undefined` callback to receive result or error
         * @returns `PreparedStatements` Object working with loaded prepared statements {execute(name, params), queryList(name,params), queryObject(name,params)}
         */
        loadAndPrepareStatements: function(moduleId, path, callback) {
            try {
                var statements = DBConnection.loadQueryFile(path);
                var res = new PreparedStatements(moduleId, statements, this);

                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }
    };


    var PreparedStatements = function(moduleId, statements, db, callback) {
        try {
            this.db = db;
            this.moduleId = moduleId;
            this.statements = statements;

            Object.keys(statements).forEach(function(key) {
                this.db.prepareStatement(this.getPreparedName(key), statements[key]);
            });

            utils.callOrIgnore(callback);
        } catch (e) {
            utils.callOrThrow(callback, e);
        }
    };

    PreparedStatements.prototype = {
        getPreparedName: function(name) {
            return this.moduleId + ':' + name;
        },

        execute: function(name, params, callback) {
            try {
                if (!this.statements[name]) {
                    throw new Error('Unknown module\'s prepared statement: ' + name);
                }

                var res = this.db.executePreparedStatement(this.getPreparedName(name), params);

                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        queryList: function(name, params, callback) {
            try {
                var json = this.execute(name, params);
                var res = JSON.parse(json);

                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },

        queryObject: function(name, params, callback) {
            try {
                var list = this.queryList(name, params);
                var res = list[0] || null;

                utils.callOrIgnore(callback, res);
                return res;
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        }
    };


    return PGconnection;
});
