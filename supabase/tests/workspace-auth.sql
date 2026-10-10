\set ON_ERROR_STOP on
begin;
create function pg_temp.assert_ok(ok boolean,message text) returns void language plpgsql as $$begin if ok is not true then raise exception 'FAIL: %',message;end if;end$$;
insert into auth.users(id,email,raw_user_meta_data) values
 ('77777777-0000-4000-8000-000000000001','workspace-admin@test.invalid','{"account_type":"client","display_name":"Synthetic Admin"}'),
 ('77777777-0000-4000-8000-000000000002','workspace-member@test.invalid','{"account_type":"individual","display_name":"Synthetic Member"}'),
 ('77777777-0000-4000-8000-000000000003','workspace-pending@test.invalid','{}');
select pg_temp.assert_ok(not exists(select 1 from public.profiles where id='77777777-0000-4000-8000-000000000003'),'registration defers immutable type selection');
select public.gw_provision_profile('77777777-0000-4000-8000-000000000003','team','Synthetic Team','ar','workspace-pending@test.invalid');
select pg_temp.assert_ok(exists(select 1 from public.team_profiles where profile_id='77777777-0000-4000-8000-000000000003'),'deferred selection provisions matching subtype');
insert into public.admin_roles(profile_id,role_id) select '77777777-0000-4000-8000-000000000001',id from public.roles where name='Super Admin';
insert into public.verification_requests(id,profile_id) values('77777777-0000-4000-8000-000000000004','77777777-0000-4000-8000-000000000002');
set local role service_role;
select public.gw_verify_external('77777777-0000-4000-8000-000000000001','77777777-0000-4000-8000-000000000004','verified','Synthetic external call completed','Synthetic review reason');
reset role;
select pg_temp.assert_ok((select verification_status='verified' from public.individual_profiles where profile_id='77777777-0000-4000-8000-000000000002'),'human approval does not require an in-platform appointment');
do $$declare caught boolean=false;begin
 begin update auth.users set email='changed@test.invalid' where id='77777777-0000-4000-8000-000000000002';exception when others then if sqlerrm='account_email_immutable' then caught=true;else raise;end if;end;
 perform pg_temp.assert_ok(caught,'direct Auth email changes are rejected');
end$$;
update auth.users set raw_user_meta_data=raw_user_meta_data||'{"name":"Updated"}'::jsonb where id='77777777-0000-4000-8000-000000000002';
select pg_temp.assert_ok((select email='workspace-member@test.invalid' from auth.users where id='77777777-0000-4000-8000-000000000002'),'ordinary auth updates preserve immutable email');
set local role authenticated;
do $$declare caught boolean=false;begin
 begin perform public.gw_verify_external('77777777-0000-4000-8000-000000000002','77777777-0000-4000-8000-000000000004','verified');exception when insufficient_privilege then caught=true;end;
 perform pg_temp.assert_ok(caught,'members cannot call administrative approval');
end$$;
reset role;
rollback;
