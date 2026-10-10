\set ON_ERROR_STOP on
begin;
do $$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); result jsonb; caught boolean;
begin
 if has_function_privilege('anon','public.gw_apply_ai_profile(uuid,text,jsonb,jsonb,boolean)','execute') or has_function_privilege('authenticated','public.gw_apply_ai_profile(uuid,text,jsonb,jsonb,boolean)','execute') then raise exception 'AI mutation exposed to browser'; end if;
 insert into auth.users(id,email,raw_user_meta_data) values(a,'assistant-'||a||'@test.invalid','{"account_type":"individual","display_name":"QA Mohammed"}'),(b,'assistant-'||b||'@test.invalid','{"account_type":"individual","display_name":"QA Other"}');
 update public.individual_profiles set years_experience=3,bio='Preserve this bio',phone_private='0591234567',email_private='qa@test.invalid' where profile_id=a;
 result:=public.gw_apply_ai_profile(a,'QA Mahmoud','{"years_experience":5}','{"display_name":"QA Mohammed","years_experience":3}');
 if (select display_name from public.profiles where id=a)<>'QA Mahmoud' or (select years_experience from public.individual_profiles where profile_id=a)<>5 then raise exception 'requested edit not saved'; end if;
 if (select bio from public.individual_profiles where profile_id=a)<>'Preserve this bio' or (select display_name from public.profiles where id=b)<>'QA Other' then raise exception 'unrelated data changed'; end if;
 caught:=false;begin perform public.gw_apply_ai_profile(a,'Stale edit','{}','{"display_name":"QA Mohammed"}');exception when others then caught:=sqlerrm='profile_conflict';end;if not caught then raise exception 'stale edit not rejected';end if;
 caught:=false;begin perform public.gw_apply_ai_profile(a,null,'{"verification_status":"verified"}','{"verification_status":"pending"}');exception when others then caught:=true;end;if not caught then raise exception 'AI verified user';end if;
 caught:=false;begin perform public.gw_apply_ai_profile(a,null,'{"hourly_rate_minor":9999}','{"hourly_rate_minor":null}');exception when others then caught:=true;end;if not caught then raise exception 'AI changed finances';end if;
 perform public.gw_apply_ai_profile(a,'QA Mohammed','{"years_experience":3}',result->'current',true);
 if (select display_name from public.profiles where id=a)<>'QA Mohammed' or (select years_experience from public.individual_profiles where profile_id=a)<>3 then raise exception 'undo failed'; end if;
 if (select count(*) from public.audit_logs where actor_id=a and action in('ai.profile.update','ai.profile.undo'))<>2 then raise exception 'audit missing'; end if;
 update public.profiles set account_status='suspended' where id=a;
 caught:=false;begin perform public.gw_apply_ai_profile(a,'Blocked edit','{}','{"display_name":"QA Mohammed"}');exception when others then caught:=true;end;if not caught then raise exception 'suspended actor permitted';end if;
end $$;
rollback;
