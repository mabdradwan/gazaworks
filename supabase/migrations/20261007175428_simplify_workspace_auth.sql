create function public.gw_verify_external(actor uuid, verification_id uuid, next_status public.verification_status, internal_notes text default null, reason text default null) returns jsonb language plpgsql set search_path='' as $$
declare v public.verification_requests; begin
 perform private.require_actor(actor,'verification.approve');
 select * into v from public.verification_requests where id=verification_id for update;
 if v.id is null or v.profile_id=actor then raise exception 'verification_not_allowed'; end if;
 if next_status not in('under_review','verified','changes_requested','rejected','suspended') then raise exception 'invalid_status'; end if;
 update public.verification_requests set status=next_status,internal_notes=coalesce(gw_verify_external.internal_notes,verification_requests.internal_notes),decision_reason=reason,reviewer_id=actor,decided_at=case when next_status in('verified','rejected','changes_requested','suspended') then now() else decided_at end where id=v.id;
 update public.individual_profiles set verification_status=next_status where profile_id=v.profile_id;
 update public.team_profiles set verification_status=next_status where profile_id=v.profile_id;
 insert into public.notifications(profile_id,category,title,body,data) values(v.profile_id,'verification','Verification status updated','Review your verification status.',jsonb_build_object('status',next_status));
 return '{"ok":true}';
end$$;
revoke all on function public.gw_verify_external(uuid,uuid,public.verification_status,text,text) from public,anon,authenticated;
grant execute on function public.gw_verify_external(uuid,uuid,public.verification_status,text,text) to service_role;

-- Fixed authentication email: prevent direct Auth API bypasses as well as UI edits.
-- The function is an invoker trigger, does not read private data and returns no secrets.
create function private.gw_fixed_auth_email() returns trigger language plpgsql set search_path='' as $$
begin
 if nullif(old.email,'') is not null and (
   new.email is distinct from old.email or
   (coalesce(to_jsonb(new)->>'email_change','')<>'' and
    (to_jsonb(new)->>'email_change') is distinct from (to_jsonb(old)->>'email_change'))
 ) then raise exception 'account_email_immutable'; end if;
 return new;
end$$;
revoke all on function private.gw_fixed_auth_email() from public,anon,authenticated;
create trigger gw_fixed_auth_email before update on auth.users for each row execute function private.gw_fixed_auth_email();
