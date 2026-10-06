-- Additive, compatible with existing callers that submit one categoryId.
alter table public.work_requests add column category_ids uuid[] not null default '{}';
update public.work_requests set category_ids=array[category_id] where category_id is not null;
alter table public.work_requests add constraint work_request_category_count check(cardinality(category_ids)<=60);

create function private.sync_work_request_categories() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op='INSERT' then
  if cardinality(new.category_ids)=0 and new.category_id is not null then new.category_ids:=array[new.category_id]; end if;
 elsif new.category_ids is not distinct from old.category_ids and new.category_id is distinct from old.category_id then
  new.category_ids:=case when new.category_id is null then '{}'::uuid[] else array[new.category_id] end;
 end if;
 if tg_op='INSERT' or new.category_ids is distinct from old.category_ids then
  if cardinality(new.category_ids)>60 or exists(select 1 from unnest(new.category_ids) c(id) where id is null or not exists(select 1 from public.categories t where t.id=c.id and t.active))
     or cardinality(new.category_ids)<>(select count(distinct id) from unnest(new.category_ids) c(id)) then raise exception 'invalid_categories'; end if;
 end if;
 new.category_id:=new.category_ids[1];
 return new;
end$$;
revoke all on function private.sync_work_request_categories() from public,anon,authenticated;
create trigger work_request_categories before insert or update of category_id,category_ids on public.work_requests
for each row execute function private.sync_work_request_categories();

create or replace function public.gw_create_work_request(actor uuid,input jsonb) returns jsonb
language plpgsql set search_path='' as $$
declare w uuid; ids uuid[]; begin
 perform private.require_actor(actor);
 if not exists(select 1 from public.profiles where id=actor and account_type='client') then raise exception 'client_required'; end if;
 if input ? 'categoryIds' then
  if jsonb_typeof(input->'categoryIds')<>'array' then raise exception 'invalid_categories'; end if;
  select coalesce(array_agg(value::uuid order by ord),'{}'::uuid[]) into ids from jsonb_array_elements_text(input->'categoryIds') with ordinality a(value,ord);
 else ids:=array[(input->>'categoryId')::uuid]; end if;
 if cardinality(ids)=0 then raise exception 'category_required'; end if;
 insert into public.work_requests(client_id,title,description,category_id,category_ids,budget_min_minor,budget_max_minor,currency,visibility,status,delivery_expectations,notes)
 values(actor,input->>'title',input->>'description',ids[1],ids,(input->>'budgetMin')::integer,(input->>'budgetMax')::integer,upper(input->>'currency'),input->>'visibility','published',input->>'deliveryExpectations',input->>'notes') returning id into w;
 insert into public.work_request_skills(work_request_id,skill_id) select w,value::uuid from jsonb_array_elements_text(coalesce(input->'skills','[]')) on conflict do nothing;
 return jsonb_build_object('id',w);
end$$;
revoke all on function public.gw_create_work_request(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.gw_create_work_request(uuid,jsonb) to service_role;
