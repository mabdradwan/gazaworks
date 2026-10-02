-- Read-only preflight. Missing rows are deployment blockers, not permission to reset a database.
select requirement, case when available then 'present' else 'MISSING' end as status
from (
 select 'login_history' as requirement, to_regclass('public.login_history') is not null as available
 union all select 'gw_provision_profile',exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='gw_provision_profile')
 union all select 'gw_save_profile',exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='gw_save_profile')
) requirements order by requirement;
