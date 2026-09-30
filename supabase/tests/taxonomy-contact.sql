\set ON_ERROR_STOP on
begin;
create temporary table taxonomy_ids(name text primary key,id uuid);
grant all on taxonomy_ids to service_role,authenticated;
create function pg_temp.id(text) returns uuid language sql as $$select id from taxonomy_ids where name=$1$$;
create function pg_temp.ok(condition boolean,label text) returns void language plpgsql as $$begin if condition is not true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end$$;
create function pg_temp.denied(statement text,expected text,label text) returns void language plpgsql as $$declare message text;begin begin execute statement;exception when others then message:=sqlerrm;end;if message is null or message not like '%'||expected||'%' then raise exception 'FAIL: %, got: %',label,coalesce(message,'no error'); end if;raise notice 'PASS: %',label;end$$;
create function pg_temp.fail_name() returns trigger language plpgsql as $$begin if new.name='Throw' then raise exception 'translation_failure'; end if; return new; end$$;
create trigger test_category_name_failure before insert or update on public.category_translations for each row execute function pg_temp.fail_name();
create trigger test_skill_name_failure before insert or update on public.skill_translations for each row execute function pg_temp.fail_name();
insert into taxonomy_ids values ('editor','93333333-3333-4333-8333-333333333333'),('reader','94444444-4444-4444-8444-444444444444');
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data)
select id,name||'@taxonomy.test',now(),jsonb_build_object('account_type','client','display_name','Taxonomy '||name) from taxonomy_ids;
insert into public.admin_roles(profile_id,role_id) select pg_temp.id('editor'),id from public.roles where name='Content Editor';

set local role service_role;
select pg_temp.denied($q$select public.gw_save_taxonomy(pg_temp.id('reader'),'skill','unauthorized','{"en":"Skill"}')$q$,'forbidden','non-editor cannot change taxonomy');
select pg_temp.denied($q$select public.gw_save_taxonomy(pg_temp.id('editor'),'category','rolled-category','{"en":"Throw"}')$q$,'translation_failure','category translation failure aborts creation');
select pg_temp.denied($q$select public.gw_save_taxonomy(pg_temp.id('editor'),'skill','rolled-skill','{"en":"Throw"}')$q$,'translation_failure','skill translation failure aborts creation');
select pg_temp.ok(not exists(select 1 from public.categories where slug='rolled-category') and not exists(select 1 from public.skills where slug='rolled-skill'),'failed translations leave no parent records');
insert into taxonomy_ids select 'category',(public.gw_save_taxonomy(pg_temp.id('editor'),'category','atomic-category','{"ar":"تصنيف","en":"Category"}')->>'id')::uuid;
insert into taxonomy_ids select 'child',(public.gw_save_taxonomy(pg_temp.id('editor'),'category','atomic-child','{"en":"Child"}',null,pg_temp.id('category'))->>'id')::uuid;
insert into taxonomy_ids select 'skill',(public.gw_save_taxonomy(pg_temp.id('editor'),'skill','atomic-skill','{"ar":"مهارة","en":"Skill"}')->>'id')::uuid;
select public.gw_save_taxonomy(pg_temp.id('editor'),'skill','updated-skill','{"fr":"Compétence"}',pg_temp.id('skill'));
select pg_temp.ok((select count(*)=3 from public.skill_translations where skill_id=pg_temp.id('skill')),'editing one language preserves existing names');
select pg_temp.denied($q$select public.gw_save_taxonomy(pg_temp.id('editor'),'skill','rollback-update','{"en":"Throw"}',pg_temp.id('skill'))$q$,'translation_failure','translation failure rolls back an update');
select pg_temp.ok((select slug='updated-skill' from public.skills where id=pg_temp.id('skill')),'failed update retains old slug');
select pg_temp.denied($q$select public.gw_save_taxonomy(pg_temp.id('editor'),'category','atomic-category','{"en":"Category"}',pg_temp.id('category'),pg_temp.id('child'))$q$,'invalid_parent','category tree cannot contain a cycle');
select pg_temp.denied($q$select public.gw_save_taxonomy(pg_temp.id('editor'),'skill','empty-names','{}')$q$,'invalid_translations','empty translations rejected');
select pg_temp.denied($q$select public.gw_save_taxonomy(pg_temp.id('editor'),'skill','bad-locale','{"xx":"Name"}')$q$,'invalid_translations','unsupported translation rejected');
select pg_temp.denied($q$select public.gw_save_taxonomy(pg_temp.id('editor'),'skill','bad-name','{"en":null}')$q$,'invalid_translations','null translation rejected');
select pg_temp.denied($q$select public.gw_save_taxonomy(pg_temp.id('editor'),'skill','missing-entry','{"en":"Name"}',gen_random_uuid())$q$,'taxonomy_not_found','missing updates cannot report success');
select pg_temp.ok((select count(*)=4 from public.audit_logs where actor_id=pg_temp.id('editor') and action='taxonomy.save'),'successful taxonomy changes are audited');

select public.gw_contact_quota(repeat('a',64));
select public.gw_contact_quota(repeat('a',64));
select public.gw_contact_quota(repeat('a',64));
select pg_temp.denied($q$select public.gw_contact_quota(repeat('a',64))$q$,'rate_limited','fourth contact request is blocked');
select public.gw_contact_quota(repeat('b',64));
select pg_temp.ok((select count=1 from private.rate_limits where key='contact:'||repeat('b',64)),'contact identities have separate quotas');
update private.rate_limits set reset_at=now()-interval '1 second' where key='contact:'||repeat('a',64);
select public.gw_contact_quota(repeat('a',64));
select pg_temp.ok((select count=1 from private.rate_limits where key='contact:'||repeat('a',64)),'contact quota resets after its window');
select pg_temp.denied($q$select public.gw_contact_quota('raw-ip-address')$q$,'invalid_identity','contact quota rejects raw identity values');

set local role authenticated;
select set_config('request.jwt.claim.sub',pg_temp.id('editor')::text,true);
select pg_temp.denied($q$select public.gw_save_taxonomy(auth.uid(),'skill','browser-write','{"en":"Name"}')$q$,'permission denied','editor browser cannot call privileged taxonomy RPC');
select pg_temp.denied($q$update public.skills set slug='browser-write' where id=pg_temp.id('skill')$q$,'permission denied','browser cannot bypass taxonomy RPC');
select pg_temp.denied($q$select public.gw_contact_quota(repeat('c',64))$q$,'permission denied','browser cannot reset public contact quotas');
rollback;
