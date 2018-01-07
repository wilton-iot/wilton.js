-- Copyright 2017, alex at staticlibs.net
--
-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
--
-- http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.

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
