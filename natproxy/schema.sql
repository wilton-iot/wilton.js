
-- cat ../../modules/wilton/natproxy/schema.sql | sqlite3 test.db
begin;

-- potgres sequence
drop sequence if exists natproxy_requests_seq;
create sequence natproxy_requests_seq;

-- sqlite sequence
--drop table if exists natproxy_requests_seq;
--create table natproxy_requests_seq(
--    value bigint
--);
--insert into natproxy_requests_seq(value) values(0);

-- requests table
drop table if exists natproxy_requests;
create table natproxy_requests(
    id bigint primary key,
    endpoint text not null,
    method text not null,
    path text not null,
    headers text,
    data text,
    response text,
    request_date timestamp without time zone,
    response_date timestamp without time zone
);

-- indices
create index natproxy_requests__endpoint_idx on natproxy_requests (endpoint);
create index natproxy_requests__request_date_idx on natproxy_requests (request_date);
create index natproxy_requests__response_date_idx on natproxy_requests (response_date);

commit;
