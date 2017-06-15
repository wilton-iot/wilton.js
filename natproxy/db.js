/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([], function() {
    "use strict";
    
    return {
        genId: function(conn) {
            var obj = conn.query("select nextval('natproxy_requests_seq') as id");
            return obj.id;
        },
        
        saveRequest: function(conn, id, req) {
            conn.execute(
                    "insert into natproxy_requests(id, method, path, headers, data, request_date)" +
                    " values(:id, :method, :path, :headers, :data, current_timestamp())", {
                        id: id,
                        method: req.method,
                        path: req.path,
                        headers: req.headers,
                        data: req.data
                    });
        },
        
        addResponse: function(conn, id, resp) {
            conn.execute(
                    "update natproxy_requests set" +
                    " response = :resp," +
                    " response_date = current_timestamp()" +
                    " where id = :id", {
                        id: id,
                        resp: resp
                    });
        },
        
        findRequestsForEndpoint: function(conn, endpoint) {
            return conn.queryList(
                    "select * from natproxy_requests" +
                    " where response is NULL" +
                    " and endpoint = :endpoint", {
                        endpoint: endpoint
                    });
        }
        
    };
});

