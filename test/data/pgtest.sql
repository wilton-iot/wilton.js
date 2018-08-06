/** insertT1 */
insert into t1 values(:foo, :bar);

/** selectT1 */
select * from t1 where bar > :bar;

/** selectT2 */
select * from t2 where b = :bool;