\set ON_ERROR_STOP on
begin;
create function pg_temp.ok(condition boolean,label text) returns void language plpgsql as $$begin if condition is not true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end$$;
insert into auth.users(id,email,raw_user_meta_data) values('a1111111-1111-4111-8111-111111111111','category-test@test.invalid','{"account_type":"client","display_name":"Category fixture"}');
create temporary table category_fixture as select array_agg(id order by slug) ids from (select id,slug from public.categories where active order by slug limit 2)c;
grant select on category_fixture to service_role;
set local role service_role;
select public.gw_create_work_request('a1111111-1111-4111-8111-111111111111',jsonb_build_object('title','Multiple categories','description','Synthetic category persistence fixture','categoryIds',to_jsonb(ids),'budgetMin',100,'budgetMax',200,'currency','USD','visibility','public','skills','[]'::jsonb)) from category_fixture;
select pg_temp.ok((select category_ids=(select ids from category_fixture) and category_id=category_ids[1] from public.work_requests where title='Multiple categories'),'multiple categories persist together');
select public.gw_create_work_request('a1111111-1111-4111-8111-111111111111',jsonb_build_object('title','Legacy category','description','Synthetic legacy category persistence fixture','categoryId',ids[1],'budgetMin',100,'budgetMax',200,'currency','USD','visibility','public','skills','[]'::jsonb)) from category_fixture;
select pg_temp.ok((select cardinality(category_ids)=1 and category_id=category_ids[1] from public.work_requests where title='Legacy category'),'legacy single-category caller remains compatible');
do $$begin
 begin
  update public.work_requests set category_ids=array['ffffffff-ffff-4fff-8fff-ffffffffffff'::uuid] where title='Multiple categories';
  raise exception 'FAIL: invalid category accepted';
 exception when raise_exception then if sqlerrm<>'invalid_categories' then raise; end if; end;
end$$;
reset role;
select pg_temp.ok(not has_function_privilege('authenticated','public.gw_create_work_request(uuid,jsonb)','execute'),'category workflow remains server-only');
rollback;
