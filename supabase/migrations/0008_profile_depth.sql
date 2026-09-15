-- Rich professional onboarding fields for GazaWorks profiles.
alter table public.individual_profiles
  add column if not exists education jsonb not null default '[]'::jsonb,
  add column if not exists experience jsonb not null default '[]'::jsonb,
  add column if not exists languages jsonb not null default '[]'::jsonb,
  add column if not exists tools text[] not null default '{}'::text[];

alter table public.team_profiles
  add column if not exists services text[] not null default '{}'::text[],
  add column if not exists expertise text[] not null default '{}'::text[],
  add column if not exists achievements text,
  add column if not exists contact_private text;

alter table public.client_profiles
  add column if not exists phone_private text;

create index if not exists profile_skills_profile_id_idx on public.profile_skills(profile_id);
