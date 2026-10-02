do $$
begin
 if (select count(*) from public.profiles where (id,account_type::text,display_name) in (
 ('88000000-0000-0000-0000-000000000001'::uuid,'individual','Legacy Individual'),
 ('88000000-0000-0000-0000-000000000002'::uuid,'team','Legacy Team'),
 ('88000000-0000-0000-0000-000000000003'::uuid,'client','Legacy Client')))<>3 then
 raise exception 'Upgrade changed or lost a legacy account';
 end if;
 if to_regclass('public.login_history') is null then raise exception 'Missing login history'; end if;
 if not exists(select 1 from pg_proc where pronamespace='public'::regnamespace and proname='gw_provision_profile') then raise exception 'Missing provisioning function'; end if;
 if not exists(select 1 from pg_proc where pronamespace='public'::regnamespace and proname='gw_save_profile') then raise exception 'Missing save function'; end if;
end $$;
-- The containing test transaction rolls back synthetic data and pending migrations.
