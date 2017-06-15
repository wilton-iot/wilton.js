/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([], function() {
    "use strict";
    
    return {
        genId: function(conn) {
            //postgres
            var obj = conn.query("select nextval('natproxy_requests_seq') as id");
            return obj.id;
            //sqlite
//            conn.execute("update natproxy_requests_seq set value = value + 1");
//            var obj = conn.query("select value as id from natproxy_requests_seq");
//            return obj.id;
        },
        
        saveRequest: function(conn, id, endpoint, req) {
            conn.doInTransaction(function() {
                conn.execute(
                        "insert into natproxy_requests(id, endpoint, method, path, headers, data, request_date)" +
                        " values(:id, :endpoint, :method, :path, :headers, :data, current_timestamp)", {
                            id: id,
                            endpoint: endpoint,
                            method: req.method,
                            path: req.path,
                            headers: req.headers,
                            data: req.data
                        });
            });
        },
        
        addResponse: function(conn, id, resp) {
            conn.doInTransaction(function() {
                conn.execute(
                        "update natproxy_requests set" +
                        " response = :resp," +
                        " response_date = current_timestamp" +
                        " where id = :id", {
                            id: id,
                            resp: resp
                        });
            });
        },
        
        findRequestsForEndpoint: function(conn, endpoint, limit) {
            return conn.queryList(
                    "select * from natproxy_requests" +
                    " where response_date is NULL" +
                    " and endpoint = :endpoint" +
                    " order by request_date desc" +
                    " limit :limit", {
                        endpoint: endpoint,
                        limit: limit
                    });
        }
        
    };
});

