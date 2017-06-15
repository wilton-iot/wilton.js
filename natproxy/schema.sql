
drop sequence if exist natproxy_requests_seq;
create sequence natproxy_requests_seq;

drop table if exists natproxy_requests;
create table natproxy_requests(
    id bigint primary key,
    endpoint text not null,
    method text not null,
    path text not null,
    headers text,
    data text,
    response text,
    request_date timestamp without timezone,
    response_date timestamp without timezone
);

create index natproxy_requests__endpoint_idx on natproxy_requests (endpoint);
