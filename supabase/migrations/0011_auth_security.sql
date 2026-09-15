-- GazaWorks authentication security and login history.
-- OAuth users without an explicit account type are provisioned after OAuth callback,
-- so the immutable primary account type is never guessed.

create table if not exists public.login_history(
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  success boolean not null default true,
  ip_hash text,
  user_agent text,
  device_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.login_history enable row level security;

create policy "own login history read" on public.login_history
for select to authenticated
using(profile_id=(select auth.uid()) or public.has_permission('security.read'));

create index if not exists login_history_profile_created_idx
on public.login_history(profile_id,created_at desc);

-- Do not silently classify new OAuth users as clients.
-- Email/password registration includes account_type metadata and is provisioned here.
-- OAuth registration is provisioned by the secure server callback after the user
-- explicitly selected an account type in the GazaWorks registration form.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
declare
  requested_text text;
  requested public.account_type;
begin
  requested_text := new.raw_user_meta_data->>'account_type';
  if requested_text is null or requested_text='' then
    return new;
  end if;

  requested := requested_text::public.account_type;

  insert into public.profiles(id,account_type,display_name,locale)
  values(
    new.id,
    requested,
    coalesce(nullif(new.raw_user_meta_data->>'display_name',''),split_part(new.email,'@',1)),
    coalesce(nullif(new.raw_user_meta_data->>'locale',''),'en')
  );

  if requested='individual' then
    insert into public.individual_profiles(profile_id,email_private) values(new.id,new.email);
  elsif requested='team' then
    insert into public.team_profiles(profile_id,team_name)
    values(new.id,coalesce(nullif(new.raw_user_meta_data->>'display_name',''),'New team'));
  else
    insert into public.client_profiles(profile_id,full_name,country_code)
    values(new.id,coalesce(nullif(new.raw_user_meta_data->>'display_name',''),'New client'),'ZZ');
  end if;

  return new;
exception
  when invalid_text_representation then raise exception 'Invalid account type';
end$$;

-- Login history is written only from trusted server code using the service role.
-- Users can read their own history; administrators with security.read can inspect it.
