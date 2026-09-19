-- GazaWorks product-completion schema additions.
-- Adds richer profiles, direct hiring, attachments, admin operations and configurable email/settings surfaces.

alter table public.individual_profiles
  add column if not exists date_of_birth_private date,
  add column if not exists preferred_fields text[] not null default '{}'::text[],
  add column if not exists linkedin_url text,
  add column if not exists website_url text;

alter table public.team_profiles
  add column if not exists linkedin_url text,
  add column if not exists website_url text;

alter table public.team_members
  add column if not exists skills text[] not null default '{}'::text[];

create table if not exists public.portfolio_skills(
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  primary key(portfolio_id,skill_id)
);

create table if not exists public.work_request_files(
  id uuid primary key default gen_random_uuid(),
  work_request_id uuid not null references public.work_requests(id) on delete cascade,
  uploader_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null check(size_bytes>0),
  created_at timestamptz not null default now()
);

create table if not exists public.verification_documents(
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid references public.verification_requests(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  label text,
  created_at timestamptz not null default now()
);

create table if not exists public.direct_hire_requests(
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.client_profiles(profile_id) on delete cascade,
  talent_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check(length(title) between 5 and 160),
  description text not null check(length(description) between 20 and 10000),
  budget_minor integer check(budget_minor>0),
  currency char(3),
  desired_delivery_at timestamptz,
  status text not null default 'sent' check(status in('sent','accepted','declined','withdrawn','converted')),
  converted_work_request_id uuid references public.work_requests(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(client_id<>talent_id)
);

create table if not exists public.profile_admin_notes(
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid references public.profiles(id),
  note text not null check(length(note) between 1 and 5000),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_notifications(
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  body text not null,
  entity_type text,
  entity_id text,
  priority text not null default 'normal' check(priority in('low','normal','high','urgent')),
  assigned_to uuid references public.profiles(id),
  resolution_status text not null default 'open' check(resolution_status in('open','assigned','resolved','dismissed')),
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.email_templates(
  key text not null,
  locale text not null check(locale in('ar','en','tr','es','fr','de')),
  subject text not null,
  body_html text not null,
  body_text text,
  enabled boolean not null default true,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  primary key(key,locale)
);

insert into public.permissions(key,description) values
 ('notifications.manage','Manage administrative notification queue'),
 ('settings.manage','Manage operational settings'),
 ('security.read','Read security logs'),
 ('audit.read','Read audit logs'),
 ('media.manage','Manage CMS media'),
 ('taxonomy.manage','Manage skills and categories'),
 ('email.manage','Manage email templates')
on conflict(key) do nothing;

insert into public.role_permissions(role_id,permission_key)
select r.id,p
from public.roles r
cross join lateral unnest(
  case r.name
    when 'Support' then array['notifications.manage','users.read']
    when 'Moderator' then array['notifications.manage']
    when 'Content Editor' then array['media.manage','taxonomy.manage','email.manage']
    when 'Finance' then array['notifications.manage']
    when 'Verification Officer' then array['notifications.manage']
    when 'Dispute Manager' then array['notifications.manage']
    else array[]::text[]
  end
) p
on conflict do nothing;

insert into public.settings(key,value,public) values
 ('external_links','{"linkedin":true,"official_website":true,"external_portfolio":false}',true),
 ('payment_methods','{"mock":true,"manual_bank_transfer":false,"bank_of_palestine":false,"regional_gateway":false}',false),
 ('supported_locales','{"locales":["ar","en","tr","es","fr","de"],"default":"en"}',true),
 ('upload_limits','{"avatar_bytes":10485760,"document_bytes":20971520,"work_request_bytes":52428800,"project_bytes":104857600}',true),
 ('feature_flags','{"direct_hire":true,"google_auth":true,"ai_assistant":true,"native_calls":false}',true)
on conflict(key) do nothing;

insert into public.email_templates(key,locale,subject,body_html,body_text)
values
 ('verification_status','en','Your GazaWorks verification status changed','<p>Your GazaWorks verification status has been updated. Sign in to review the latest status.</p>','Your GazaWorks verification status has been updated. Sign in to review the latest status.'),
 ('payment_confirmation','en','GazaWorks payment confirmation','<p>A project payment event was recorded in GazaWorks. Sign in to review the transaction.</p>','A project payment event was recorded in GazaWorks. Sign in to review the transaction.'),
 ('dispute_update','en','GazaWorks dispute update','<p>There is an important update to a GazaWorks dispute. Sign in to review it.</p>','There is an important update to a GazaWorks dispute. Sign in to review it.'),
 ('security_alert','en','GazaWorks security alert','<p>We detected an important security event on your GazaWorks account. Sign in and review your account security.</p>','We detected an important security event on your GazaWorks account.'),
 ('verification_status','ar','تحديث حالة التحقق في GazaWorks','<p>تم تحديث حالة التحقق في حسابك على GazaWorks. سجّل الدخول لمراجعة الحالة الجديدة.</p>','تم تحديث حالة التحقق في حسابك على GazaWorks. سجّل الدخول لمراجعة الحالة الجديدة.'),
 ('payment_confirmation','ar','تأكيد دفعة في GazaWorks','<p>تم تسجيل حدث مالي مرتبط بأحد مشاريعك في GazaWorks. سجّل الدخول لمراجعة المعاملة.</p>','تم تسجيل حدث مالي مرتبط بأحد مشاريعك في GazaWorks. سجّل الدخول لمراجعة المعاملة.'),
 ('dispute_update','ar','تحديث نزاع في GazaWorks','<p>يوجد تحديث مهم على نزاع في GazaWorks. سجّل الدخول لمراجعته.</p>','يوجد تحديث مهم على نزاع في GazaWorks. سجّل الدخول لمراجعته.'),
 ('security_alert','ar','تنبيه أمني من GazaWorks','<p>تم رصد حدث أمني مهم في حسابك على GazaWorks. سجّل الدخول وراجع أمان الحساب.</p>','تم رصد حدث أمني مهم في حسابك على GazaWorks.')
on conflict(key,locale) do nothing;

alter table public.portfolio_skills enable row level security;
alter table public.work_request_files enable row level security;
alter table public.verification_documents enable row level security;
alter table public.direct_hire_requests enable row level security;
alter table public.profile_admin_notes enable row level security;
alter table public.admin_notifications enable row level security;
alter table public.email_templates enable row level security;

create policy "portfolio skills directory read" on public.portfolio_skills for select to authenticated using (
  exists(
    select 1 from public.portfolios p
    where p.id=portfolio_id and (
      p.profile_id=(select auth.uid())
      or exists(select 1 from public.individual_profiles i where i.profile_id=p.profile_id and i.verification_status='verified')
      or exists(select 1 from public.team_profiles t where t.profile_id=p.profile_id and t.verification_status='verified')
      or public.has_permission('users.read')
    )
  )
);
create policy "portfolio skills owner manage" on public.portfolio_skills for all to authenticated
using(exists(select 1 from public.portfolios p where p.id=portfolio_id and p.profile_id=(select auth.uid())))
with check(exists(select 1 from public.portfolios p where p.id=portfolio_id and p.profile_id=(select auth.uid())));

create policy "work request files participant read" on public.work_request_files for select to authenticated using (
  exists(
    select 1 from public.work_requests w
    where w.id=work_request_id and (
      w.client_id=(select auth.uid())
      or (w.status='published' and w.visibility='public')
      or exists(select 1 from public.work_request_invites i where i.work_request_id=w.id and i.profile_id=(select auth.uid()))
      or public.has_permission('projects.read')
    )
  )
);
create policy "work request files owner manage" on public.work_request_files for all to authenticated
using(
  uploader_id=(select auth.uid())
  and exists(select 1 from public.work_requests w where w.id=work_request_id and w.client_id=(select auth.uid()))
)
with check(
  uploader_id=(select auth.uid())
  and exists(select 1 from public.work_requests w where w.id=work_request_id and w.client_id=(select auth.uid()))
);

create policy "verification documents owner read" on public.verification_documents for select to authenticated using(
  profile_id=(select auth.uid()) or public.has_permission('verification.approve')
);
create policy "verification documents owner insert" on public.verification_documents for insert to authenticated with check(
  profile_id=(select auth.uid())
);
create policy "verification documents owner delete draft" on public.verification_documents for delete to authenticated using(
  profile_id=(select auth.uid()) and (
    request_id is null or exists(select 1 from public.verification_requests r where r.id=request_id and r.status in('requested','changes_requested'))
  )
);

create policy "direct hire participants read" on public.direct_hire_requests for select to authenticated using(
  client_id=(select auth.uid()) or talent_id=(select auth.uid()) or public.has_permission('projects.read')
);
create policy "direct hire client create" on public.direct_hire_requests for insert to authenticated with check(
  client_id=(select auth.uid())
  and exists(select 1 from public.profiles p where p.id=talent_id and p.account_type in('individual','team') and p.account_status='active')
);
create policy "direct hire client withdraw" on public.direct_hire_requests for update to authenticated
using(client_id=(select auth.uid()) and status='sent')
with check(client_id=(select auth.uid()));
create policy "direct hire talent respond" on public.direct_hire_requests for update to authenticated
using(talent_id=(select auth.uid()) and status='sent')
with check(talent_id=(select auth.uid()));

create policy "profile notes admin read" on public.profile_admin_notes for select to authenticated using(public.has_permission('users.read'));
create policy "profile notes admin insert" on public.profile_admin_notes for insert to authenticated with check(public.has_permission('users.edit'));

create policy "admin notifications read" on public.admin_notifications for select to authenticated using(
  public.has_permission('notifications.manage') or public.has_permission('*')
);
create policy "admin notifications manage" on public.admin_notifications for all to authenticated
using(public.has_permission('notifications.manage') or public.has_permission('*'))
with check(public.has_permission('notifications.manage') or public.has_permission('*'));

create policy "email templates admin read" on public.email_templates for select to authenticated using(
  public.has_permission('email.manage') or public.has_permission('content.edit') or public.has_permission('*')
);
create policy "email templates admin manage" on public.email_templates for all to authenticated
using(public.has_permission('email.manage') or public.has_permission('*'))
with check(public.has_permission('email.manage') or public.has_permission('*'));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('work-request-files','work-request-files',false,52428800,null),
 ('payout-proofs','payout-proofs',false,20971520,array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;

create policy "work request storage participant read" on storage.objects for select to authenticated using (
  bucket_id='work-request-files'
  and exists(
    select 1 from public.work_requests w
    where w.id::text=(storage.foldername(name))[1] and (
      w.client_id=(select auth.uid())
      or (w.status='published' and w.visibility='public')
      or exists(select 1 from public.work_request_invites i where i.work_request_id=w.id and i.profile_id=(select auth.uid()))
      or public.has_permission('projects.read')
    )
  )
);
create policy "work request storage client upload" on storage.objects for insert to authenticated with check (
  bucket_id='work-request-files'
  and exists(select 1 from public.work_requests w where w.id::text=(storage.foldername(name))[1] and w.client_id=(select auth.uid()))
);
create policy "work request storage client delete" on storage.objects for delete to authenticated using (
  bucket_id='work-request-files'
  and exists(select 1 from public.work_requests w where w.id::text=(storage.foldername(name))[1] and w.client_id=(select auth.uid()))
);

create policy "payout proof finance read" on storage.objects for select to authenticated using (
  bucket_id='payout-proofs' and (public.has_permission('payments.read') or public.has_permission('payouts.approve') or public.has_permission('*'))
);
create policy "payout proof finance upload" on storage.objects for insert to authenticated with check (
  bucket_id='payout-proofs' and (public.has_permission('payouts.approve') or public.has_permission('*'))
);

create index if not exists portfolio_skills_skill_idx on public.portfolio_skills(skill_id);
create index if not exists work_request_files_request_idx on public.work_request_files(work_request_id);
create index if not exists verification_documents_profile_idx on public.verification_documents(profile_id);
create index if not exists direct_hire_client_idx on public.direct_hire_requests(client_id,created_at desc);
create index if not exists direct_hire_talent_idx on public.direct_hire_requests(talent_id,created_at desc);
create index if not exists admin_notifications_queue_idx on public.admin_notifications(resolution_status,priority,created_at desc);

create or replace function public.capture_profile_change() returns trigger
language plpgsql security definer set search_path=public as $$
declare pid uuid;
begin
  pid := coalesce((to_jsonb(new)->>'profile_id')::uuid,(to_jsonb(new)->>'id')::uuid);
  insert into public.profile_change_history(profile_id,changed_by,changes,significant)
  values(pid,auth.uid(),jsonb_build_object('table',TG_TABLE_NAME,'before',to_jsonb(old),'after',to_jsonb(new)),true);
  insert into public.admin_notifications(category,title,body,entity_type,entity_id,priority,data)
  values('profile_changes','Profile updated','A professional profile was updated and may require review.',TG_TABLE_NAME,pid::text,'normal',jsonb_build_object('profileId',pid));
  return new;
end$$;
revoke execute on function public.capture_profile_change() from public,anon,authenticated;

drop trigger if exists history_profiles on public.profiles;
create trigger history_profiles after update on public.profiles for each row execute function public.capture_profile_change();
drop trigger if exists history_individual_profiles on public.individual_profiles;
create trigger history_individual_profiles after update on public.individual_profiles for each row execute function public.capture_profile_change();
drop trigger if exists history_team_profiles on public.team_profiles;
create trigger history_team_profiles after update on public.team_profiles for each row execute function public.capture_profile_change();

do $$
declare t text;
begin
  foreach t in array array['direct_hire_requests','profile_admin_notes','admin_notifications','email_templates']
  loop
    execute format('drop trigger if exists %I on public.%I','audit_'||t,t);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.audit_row_change()','audit_'||t,t);
  end loop;
end$$;
