-- Server-only, atomic assistant edits. Caller identity comes from verified Auth.
create or replace function public.gw_apply_ai_profile(actor uuid, display_name text, details jsonb, expected jsonb, undo boolean default false)
returns jsonb language plpgsql set search_path='' as $$
declare p public.profiles; current_details jsonb; snapshot jsonb; previous jsonb; k text; allowed text[]; result jsonb;
begin
 perform private.require_actor(actor);
 select * into p from public.profiles where id=actor for update;
 if p.account_type='individual' then
  allowed:=array['professional_title','bio','gaza_location','availability','years_experience','languages','tools','preferred_fields','linkedin_url','website_url','education','experience'];
  select to_jsonb(i) into current_details from public.individual_profiles i where profile_id=actor for update;
 elsif p.account_type='team' then
  allowed:=array['description','gaza_location','team_size','services','expertise','achievements','history','linkedin_url','website_url'];
  select to_jsonb(t) into current_details from public.team_profiles t where profile_id=actor for update;
 elsif p.account_type='client' then
  allowed:=array['country_code','company_name','organization_type'];
  select to_jsonb(c) into current_details from public.client_profiles c where profile_id=actor for update;
 else raise exception 'forbidden'; end if;
 if current_details is null or jsonb_typeof(details)<>'object' or jsonb_typeof(expected)<>'object' or details-allowed<>'{}'::jsonb then raise exception 'invalid_profile_fields'; end if;
 snapshot:='{}'::jsonb;
 if display_name is not null then snapshot:=jsonb_build_object('display_name',p.display_name); end if;
 for k in select jsonb_object_keys(details) loop snapshot:=snapshot||jsonb_build_object(k,current_details->k); end loop;
 if snapshot<>expected then raise exception 'profile_conflict'; end if;
 previous:=snapshot;
 result:=public.gw_save_profile(actor,display_name,details,null,null);
 snapshot:=details;
 if display_name is not null then snapshot:=snapshot||jsonb_build_object('display_name',display_name); end if;
 insert into public.audit_logs(actor_id,action,entity_type,entity_id,old_data,new_data)
 values(actor,case when undo then 'ai.profile.undo' else 'ai.profile.update' end,'profile',actor::text,previous,snapshot);
 return jsonb_build_object('ok',true,'previous',previous,'current',snapshot,'profile',result);
end$$;
revoke all on function public.gw_apply_ai_profile(uuid,text,jsonb,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.gw_apply_ai_profile(uuid,text,jsonb,jsonb,boolean) to service_role;
