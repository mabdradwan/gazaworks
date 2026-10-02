-- A direct request must reach an active verified professional, even when the
-- caller bypasses the application API and inserts through PostgREST.
create function private.guard_direct_hire_insert() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.status <> 'sent' or new.converted_work_request_id is not null
    or not exists (
      select 1 from public.profiles p
      where p.id = new.client_id and p.account_type = 'client' and p.account_status = 'active'
    ) or not private.verified_talent(new.talent_id) then
    raise exception 'direct_hire_unavailable' using errcode='42501';
  end if;
  return new;
end$$;

create trigger direct_hire_validate before insert on public.direct_hire_requests
for each row execute function private.guard_direct_hire_insert();

-- The invitation and its in-app notification commit or roll back together.
create function private.notify_direct_hire() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  insert into public.notifications(profile_id,category,title,body,data)
  values(new.talent_id,'projects','Direct work request',new.title,
    jsonb_build_object('directHireId',new.id,'clientId',new.client_id));
  return new;
end$$;

create trigger direct_hire_notify after insert on public.direct_hire_requests
for each row execute function private.notify_direct_hire();
revoke all on function private.guard_direct_hire_insert(),private.notify_direct_hire() from public,anon,authenticated;
