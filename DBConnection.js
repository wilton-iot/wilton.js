/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "./dyload",
    "./wiltoncall",
    "./utils"
], function(dyload, wiltoncall, utils) {
    "use strict";

    dyload({
        name: "wilton_db"
    });

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
                utils.callOrThrow(callback, e, []);
            }
        },
        
        query: function(sql, params, callback) {
            var list = this.queryList(sql, params, {
                onFailure: function(err) {
                    if (!utils.undefinedOrNull(err)) {
                        callback(err);
                    }
                }
            });
            if (list instanceof Array) {
                var res = null;
                if (list.length > 1) {
                    return list;
                } else if (1 === list.length) {
                    res = list[0];
                }
                utils.callOrIgnore(callback, res);
                return res;
            }
            // else error happened
            return {};
        },
        
        doInTransaction: function(operations, callback) {
            try {
                var tranJson = wiltoncall("db_transaction_start", {
                    connectionHandle: this.handle
                });
                var tran = JSON.parse(tranJson);
                try {
                    operations();
                    wiltoncall("db_transaction_commit", {
                        transactionHandle: tran.transactionHandle
                    });
                } catch (e) {
                    wiltoncall("db_transaction_rollback", {
                        transactionHandle: tran.transactionHandle
                    });
                    utils.callOrThrow(callback, e);
                }
                utils.callOrIgnore(callback);
            } catch (e) {
                utils.callOrThrow(callback, e);
            }
        },
        
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
    
    return DBConnection;
});
