/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["./utils"], function(utils) {
    "use strict";

    var DBConnection = function(config) {
        var opts = utils.defaultObject(config);
        try {
            this.url = opts.url;
            var handleJson = wiltoncall("db_connection_open", this.url);
            var handleParsed = JSON.parse(handleJson);
            this.handle = handleParsed.connectionHandle;
            utils.callOrIgnore(opts.onSuccess);
        } catch (e) {
            utils.callOrThrow(opts.onFailure, e);
        }
    };

    DBConnection.prototype = {
        execute: function(sql, params, options) {
            var opts = utils.defaultObject(options);
            try {
                var sqlstr = utils.defaultString(sql);
                var pars = utils.defaultObject(params);
                wiltoncall("db_connection_execute", JSON.stringify({
                    connectionHandle: this.handle,
                    sql: sqlstr,
                    params: pars
                }));
                utils.callOrIgnore(opts.onSuccess);
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        },
        
        queryList: function(sql, params, options) {
            var opts = utils.defaultObject(options);
            try {
                var sqlstr = utils.defaultString(sql);
                var pars = utils.defaultObject(params);
                var json = wiltoncall("db_connection_query", JSON.stringify({
                    connectionHandle: this.handle,
                    sql: sqlstr,
                    params: pars
                }));
                var res = JSON.parse(json);
                utils.callOrIgnore(opts.onSuccess, res);
                return res;
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e, []);
            }
        },
        
        query: function(sql, params, options) {
            var opts = utils.defaultObject(options);
            var list = this.queryList(sql, params, {
                onFailure: opts.onFailure
            });
            if (list instanceof Array) {
                var res = null;
                if (list.length > 1) {
                    return list;
                } else if (1 === list.length) {
                    res = list[0];
                }
                utils.callOrIgnore(opts.onSuccess, res);
                return res;
            }
            // else error happened
            return {};
        },
        
        doInTransaction: function(callback, options) {
            var opts = utils.defaultObject(options);
            try {
                var tranJson = wiltoncall("db_transaction_start", JSON.stringify({
                    connectionHandle: this.handle
                }));
                var tran = JSON.parse(tranJson);
                try {
                    callback();
                    wiltoncall("db_transaction_commit", JSON.stringify({
                        transactionHandle: tran.transactionHandle
                    }));
                } catch (e) {
                    wiltoncall("db_transaction_rollback", JSON.stringify({
                        transactionHandle: tran.transactionHandle
                    }));
                    utils.callOrThrow(opts.onFailure, e);
                }
                utils.callOrIgnore(opts.onSuccess);
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        },
        
        close: function(options) {
            var opts = utils.defaultObject(options);
            try {
                wiltoncall("db_connection_close", JSON.stringify({
                    connectionHandle: this.handle
                }));
                utils.callOrIgnore(opts.onSuccess);
            } catch (e) {
                utils.callOrThrow(opts.onFailure, e);
            }
        }
    };
    
    return DBConnection;
});
