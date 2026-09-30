-- Taxonomy names and their parent record must commit together. Taxonomy
-- permissions are checked in the database rather than delegated to the browser.
revoke insert,update,delete on public.categories,public.category_translations,
  public.skills,public.skill_translations from public,anon,authenticated;

create function public.gw_save_taxonomy(
  actor uuid,entry_kind text,entry_slug text,translations jsonb,
  entry_id uuid default null,parent_id uuid default null
) returns jsonb language plpgsql set search_path='' as $$
declare saved_id uuid; previous_data jsonb;
begin
  perform private.require_actor(actor,'taxonomy.manage');
  if entry_kind is null or entry_kind not in('category','skill')
    or entry_slug is null or entry_slug !~ '^[a-z0-9-]{2,100}$'
    or translations is null or jsonb_typeof(translations)<>'object'
  then raise exception 'invalid_taxonomy'; end if;
  if translations='{}'::jsonb or exists(
    select 1 from jsonb_each(translations) t where t.key not in('ar','en','tr','es','fr','de')
      or jsonb_typeof(t.value)<>'string' or length(trim(t.value#>>'{}')) not between 1 and 150
  ) then raise exception 'invalid_translations'; end if;
  if entry_kind='skill' and parent_id is not null then raise exception 'invalid_parent'; end if;
  -- Serializing tree edits prevents concurrent moves from creating a cycle.
  perform pg_advisory_xact_lock(hashtextextended('gazaworks:taxonomy',0));
  if entry_kind='category' then
    if parent_id is not null then
      if not exists(select 1 from public.categories c where c.id=gw_save_taxonomy.parent_id)
        then raise exception 'invalid_parent'; end if;
      if entry_id is not null and exists(
        with recursive ancestors as (
          select c.id,c.parent_id from public.categories c where c.id=gw_save_taxonomy.parent_id
          union
          select c.id,c.parent_id from public.categories c join ancestors a on c.id=a.parent_id
        ) select 1 from ancestors where id=entry_id
      ) then raise exception 'invalid_parent'; end if;
    end if;
    if entry_id is null then
      insert into public.categories(slug,parent_id) values(entry_slug,parent_id) returning id into saved_id;
    else
      select to_jsonb(c) into previous_data from public.categories c where c.id=entry_id for update;
      update public.categories c set slug=entry_slug,parent_id=gw_save_taxonomy.parent_id
      where c.id=entry_id returning id into saved_id;
      if saved_id is null then raise exception 'taxonomy_not_found'; end if;
    end if;
    insert into public.category_translations(category_id,locale,name)
    select saved_id,t.key,trim(t.value) from jsonb_each_text(translations) t
    on conflict on constraint category_translations_pkey do update set name=excluded.name;
  else
    if entry_id is null then
      insert into public.skills(slug) values(entry_slug) returning id into saved_id;
    else
      select to_jsonb(s) into previous_data from public.skills s where s.id=entry_id for update;
      update public.skills s set slug=entry_slug where s.id=entry_id returning id into saved_id;
      if saved_id is null then raise exception 'taxonomy_not_found'; end if;
    end if;
    insert into public.skill_translations(skill_id,locale,name)
    select saved_id,t.key,trim(t.value) from jsonb_each_text(translations) t
    on conflict on constraint skill_translations_pkey do update set name=excluded.name;
  end if;
  insert into public.audit_logs(actor_id,action,entity_type,entity_id,old_data,new_data)
  values(actor,'taxonomy.save',case entry_kind when 'category' then 'categories' else 'skills' end,
    saved_id::text,previous_data,jsonb_build_object('slug',entry_slug,'translations',translations,'parent_id',parent_id));
  return jsonb_build_object('id',saved_id,'ok',true);
end$$;
revoke all on function public.gw_save_taxonomy(uuid,text,text,jsonb,uuid,uuid) from public,anon,authenticated;
grant execute on function public.gw_save_taxonomy(uuid,text,text,jsonb,uuid,uuid) to service_role;

-- Public contact requests share a durable quota across serverless instances.
-- The server sends a keyed digest; raw IP addresses are never stored here.
create function public.gw_contact_quota(identity_hash text) returns void language plpgsql set search_path='' as $$
begin
  if identity_hash is null or identity_hash !~ '^[a-f0-9]{64}$' then raise exception 'invalid_identity'; end if;
  perform private.consume_rate('contact:'||identity_hash,3,600);
  delete from private.rate_limits where reset_at<now()-interval '1 day';
end$$;
revoke all on function public.gw_contact_quota(text) from public,anon,authenticated;
grant execute on function public.gw_contact_quota(text) to service_role;
