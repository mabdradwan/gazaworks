-- GazaWorks security hardening and operational RLS.
-- This migration closes the initial policy gaps discovered by Supabase advisors.

-- Taxonomy is readable by everyone but writable only by content administrators.
alter table public.categories enable row level security;
alter table public.category_translations enable row level security;
alter table public.skills enable row level security;
alter table public.skill_translations enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

create policy "taxonomy categories read" on public.categories for select using (active = true or public.has_permission('content.edit'));
create policy "taxonomy category translations read" on public.category_translations for select using (
  exists(select 1 from public.categories c where c.id=category_id and c.active=true)
  or public.has_permission('content.edit')
);
create policy "taxonomy skills read" on public.skills for select using (active = true or public.has_permission('content.edit'));
create policy "taxonomy skill translations read" on public.skill_translations for select using (
  exists(select 1 from public.skills s where s.id=skill_id and s.active=true)
  or public.has_permission('content.edit')
);
create policy "taxonomy categories manage" on public.categories for all to authenticated using (public.has_permission('content.edit')) with check (public.has_permission('content.edit'));
create policy "taxonomy category translations manage" on public.category_translations for all to authenticated using (public.has_permission('content.edit')) with check (public.has_permission('content.edit'));
create policy "taxonomy skills manage" on public.skills for all to authenticated using (public.has_permission('content.edit')) with check (public.has_permission('content.edit'));
create policy "taxonomy skill translations manage" on public.skill_translations for all to authenticated using (public.has_permission('content.edit')) with check (public.has_permission('content.edit'));

-- RBAC metadata is never anonymous. Administrators can inspect/manage it.
create policy "rbac roles read" on public.roles for select to authenticated using (public.has_permission('users.read'));
create policy "rbac permissions read" on public.permissions for select to authenticated using (public.has_permission('users.read'));
create policy "rbac role permissions read" on public.role_permissions for select to authenticated using (public.has_permission('users.read'));
create policy "rbac roles manage" on public.roles for all to authenticated using (public.has_permission('*')) with check (public.has_permission('*'));
create policy "rbac permissions manage" on public.permissions for all to authenticated using (public.has_permission('*')) with check (public.has_permission('*'));
create policy "rbac role permissions manage" on public.role_permissions for all to authenticated using (public.has_permission('*')) with check (public.has_permission('*'));
create policy "admin roles read" on public.admin_roles for select to authenticated using (profile_id=(select auth.uid()) or public.has_permission('users.read'));
create policy "admin roles manage" on public.admin_roles for all to authenticated using (public.has_permission('*')) with check (public.has_permission('*'));

-- User-owned professional metadata.
create policy "profile skills owner manage" on public.profile_skills for all to authenticated
  using (profile_id=(select auth.uid()))
  with check (profile_id=(select auth.uid()));
create policy "profile skills verified read" on public.profile_skills for select to authenticated
  using (
    exists(select 1 from public.individual_profiles i where i.profile_id=profile_skills.profile_id and i.verification_status='verified')
    or exists(select 1 from public.team_profiles t where t.profile_id=profile_skills.profile_id and t.verification_status='verified')
    or public.has_permission('users.read')
  );

-- Work request taxonomy and invitations.
create policy "work request skills read" on public.work_request_skills for select to authenticated using (
  exists(select 1 from public.work_requests w where w.id=work_request_id and
    (w.client_id=(select auth.uid()) or (w.status='published' and w.visibility='public')))
  or public.has_permission('projects.read')
);
create policy "work request skills client manage" on public.work_request_skills for all to authenticated using (
  exists(select 1 from public.work_requests w where w.id=work_request_id and w.client_id=(select auth.uid()))
) with check (
  exists(select 1 from public.work_requests w where w.id=work_request_id and w.client_id=(select auth.uid()))
);
create policy "work request invites read" on public.work_request_invites for select to authenticated using (
  profile_id=(select auth.uid())
  or exists(select 1 from public.work_requests w where w.id=work_request_id and w.client_id=(select auth.uid()))
  or public.has_permission('projects.read')
);
create policy "work request invites client manage" on public.work_request_invites for all to authenticated using (
  exists(select 1 from public.work_requests w where w.id=work_request_id and w.client_id=(select auth.uid()))
) with check (
  exists(select 1 from public.work_requests w where w.id=work_request_id and w.client_id=(select auth.uid()))
);

-- Project collaboration.
create policy "project agreements read" on public.project_agreements for select to authenticated using (
  exists(select 1 from public.projects p where p.id=project_id and (p.client_id=(select auth.uid()) or p.talent_id=(select auth.uid())))
  or public.has_permission('projects.read')
);
create policy "project files read" on public.project_files for select to authenticated using (
  exists(select 1 from public.projects p where p.id=project_id and (p.client_id=(select auth.uid()) or p.talent_id=(select auth.uid())))
  or public.has_permission('projects.read')
);
create policy "project files upload" on public.project_files for insert to authenticated with check (
  uploader_id=(select auth.uid())
  and exists(select 1 from public.projects p where p.id=project_id and (p.client_id=(select auth.uid()) or p.talent_id=(select auth.uid())))
);

-- Chat access. Rooms are visible only to participants/admins.
create policy "chat rooms participant read" on public.chat_rooms for select to authenticated using (
  exists(select 1 from public.chat_participants cp where cp.room_id=chat_rooms.id and cp.profile_id=(select auth.uid()))
  or public.has_permission('messages.review')
);
create policy "chat participants read" on public.chat_participants for select to authenticated using (
  profile_id=(select auth.uid())
  or exists(select 1 from public.chat_participants mine where mine.room_id=chat_participants.room_id and mine.profile_id=(select auth.uid()))
  or public.has_permission('messages.review')
);
create policy "chat participants project join" on public.chat_participants for insert to authenticated with check (
  profile_id=(select auth.uid())
  and exists(
    select 1 from public.chat_rooms r join public.projects p on p.id=r.project_id
    where r.id=room_id and (p.client_id=(select auth.uid()) or p.talent_id=(select auth.uid()))
  )
);
create policy "message moderation submit own held" on public.message_moderation for insert to authenticated with check (
  exists(select 1 from public.chat_messages m where m.id=message_id and m.sender_id=(select auth.uid()) and m.status='pending_moderation')
);
create policy "message moderation sender read" on public.message_moderation for select to authenticated using (
  exists(select 1 from public.chat_messages m where m.id=message_id and m.sender_id=(select auth.uid()))
  or public.has_permission('messages.review')
);
create policy "message moderation admin update" on public.message_moderation for update to authenticated
  using (public.has_permission('messages.review'))
  with check (public.has_permission('messages.review'));

-- Financial records are readable by transaction parties and finance admins. Writes remain server-side.
create policy "payments parties read" on public.payments for select to authenticated using (
  exists(select 1 from public.transactions t where t.id=transaction_id and (t.client_id=(select auth.uid()) or t.talent_id=(select auth.uid())))
  or public.has_permission('payments.read')
);
create policy "ledger parties read" on public.ledger_entries for select to authenticated using (
  exists(select 1 from public.transactions t where t.id=transaction_id and (t.client_id=(select auth.uid()) or t.talent_id=(select auth.uid())))
  or public.has_permission('payments.read')
);
create policy "payout parties read" on public.payouts for select to authenticated using (
  exists(select 1 from public.transactions t where t.id=transaction_id and (t.client_id=(select auth.uid()) or t.talent_id=(select auth.uid())))
  or public.has_permission('payments.read')
);
create policy "payout admin manage" on public.payouts for all to authenticated
  using (public.has_permission('payouts.approve'))
  with check (public.has_permission('payouts.approve'));

-- Dispute evidence and appeals.
create policy "dispute evidence read" on public.dispute_evidence for select to authenticated using (
  exists(select 1 from public.disputes d join public.projects p on p.id=d.project_id
    where d.id=dispute_id and (p.client_id=(select auth.uid()) or p.talent_id=(select auth.uid())))
  or public.has_permission('disputes.manage')
);
create policy "dispute evidence submit" on public.dispute_evidence for insert to authenticated with check (
  submitted_by=(select auth.uid())
  and exists(select 1 from public.disputes d join public.projects p on p.id=d.project_id
    where d.id=dispute_id and (p.client_id=(select auth.uid()) or p.talent_id=(select auth.uid())))
);
create policy "appeals parties read" on public.appeals for select to authenticated using (
  exists(select 1 from public.disputes d join public.projects p on p.id=d.project_id
    where d.id=dispute_id and (p.client_id=(select auth.uid()) or p.talent_id=(select auth.uid())))
  or public.has_permission('disputes.manage')
);
create policy "appeals admin update" on public.appeals for update to authenticated
  using (public.has_permission('disputes.manage'))
  with check (public.has_permission('disputes.manage'));

-- Reviews are visible to signed-in marketplace users; only existing author policy writes.
create policy "reviews authenticated read" on public.reviews for select to authenticated using (moderation_status='published' or author_id=(select auth.uid()) or public.has_permission('users.read'));

-- Notifications can be marked read by their owner.
create policy "notifications owner update" on public.notifications for update to authenticated
  using (profile_id=(select auth.uid()))
  with check (profile_id=(select auth.uid()));

-- AI draft records must be writable/readable only by their owner or administrators.
create policy "ai interactions own insert" on public.ai_interactions for insert to authenticated with check (profile_id=(select auth.uid()));
create policy "ai interactions own read" on public.ai_interactions for select to authenticated using (profile_id=(select auth.uid()) or public.has_permission('users.read'));
create policy "ai interactions own update" on public.ai_interactions for update to authenticated using (profile_id=(select auth.uid())) with check (profile_id=(select auth.uid()));

-- CMS media and settings.
create policy "media admin manage" on public.media for all to authenticated using (public.has_permission('content.edit')) with check (public.has_permission('content.edit'));
create policy "settings public read" on public.settings for select using (public=true or public.has_permission('*'));
create policy "settings admin manage" on public.settings for all to authenticated using (public.has_permission('*')) with check (public.has_permission('*'));

-- Audit/security/history remain private except authorized readers.
create policy "audit admin read" on public.audit_logs for select to authenticated using (public.has_permission('*'));
create policy "security self or admin read" on public.security_logs for select to authenticated using (profile_id=(select auth.uid()) or public.has_permission('*'));
create policy "profile history self or admin read" on public.profile_change_history for select to authenticated using (profile_id=(select auth.uid()) or public.has_permission('users.read'));

-- Harden functions.
create or replace function public.guard_account_type() returns trigger language plpgsql set search_path=public as $$
begin
  if old.account_type<>new.account_type then raise exception 'Primary account type cannot be changed'; end if;
  return new;
end$$;
create or replace function public.prevent_audit_mutation() returns trigger language plpgsql set search_path=public as $$
begin
  raise exception 'Audit logs are append-only';
end$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.has_permission(text) from anon;
grant execute on function public.has_permission(text) to authenticated;

-- Project/message storage access is scoped by path convention:
-- project-files/<project_uuid>/<filename>, message-files/<room_uuid>/<filename>.
create policy "project storage participant read" on storage.objects for select to authenticated using (
  bucket_id='project-files'
  and exists(
    select 1 from public.projects p
    where p.id::text=(storage.foldername(name))[1]
      and (p.client_id=(select auth.uid()) or p.talent_id=(select auth.uid()))
  )
);
create policy "project storage participant upload" on storage.objects for insert to authenticated with check (
  bucket_id='project-files'
  and exists(
    select 1 from public.projects p
    where p.id::text=(storage.foldername(name))[1]
      and (p.client_id=(select auth.uid()) or p.talent_id=(select auth.uid()))
  )
);
create policy "message storage participant read" on storage.objects for select to authenticated using (
  bucket_id='message-files'
  and exists(
    select 1 from public.chat_participants cp
    where cp.room_id::text=(storage.foldername(name))[1] and cp.profile_id=(select auth.uid())
  )
);
create policy "message storage participant upload" on storage.objects for insert to authenticated with check (
  bucket_id='message-files'
  and exists(
    select 1 from public.chat_participants cp
    where cp.room_id::text=(storage.foldername(name))[1] and cp.profile_id=(select auth.uid())
  )
);

-- Add indexes for every foreign key that does not already have a covering index.
do $$
declare
  r record;
  idx_name text;
  cols text;
begin
  for r in
    select c.conrelid, c.conname, n.nspname, cl.relname, c.conkey
    from pg_constraint c
    join pg_class cl on cl.oid=c.conrelid
    join pg_namespace n on n.oid=cl.relnamespace
    where c.contype='f' and n.nspname='public'
  loop
    select string_agg(quote_ident(a.attname), ', ' order by k.ord),
           'idx_'||r.relname||'_'||string_agg(a.attname, '_' order by k.ord)
      into cols, idx_name
    from unnest(r.conkey) with ordinality as k(attnum,ord)
    join pg_attribute a on a.attrelid=r.conrelid and a.attnum=k.attnum;

    if not exists (
      select 1
      from pg_index i
      where i.indrelid=r.conrelid
        and (i.indkey::smallint[])[0:cardinality(r.conkey)-1] @> r.conkey
    ) then
      execute format('create index if not exists %I on %I.%I (%s)', left(idx_name,63), r.nspname, r.relname, cols);
    end if;
  end loop;
end$$;
