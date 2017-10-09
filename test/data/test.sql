
-- sql file contents example
-- some header notes

/** myTestSelect */
select foo from bar
    where baz = 1
    and 1 > 0 -- stupid condidion
    limit 42

/** myTestSelect2 */
-- slow query
delete from foo
    where baz = 1

/** myTestSelect3 */
drop table foo
