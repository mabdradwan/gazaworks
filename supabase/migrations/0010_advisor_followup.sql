-- GazaWorks database advisor follow-up.
-- Adds covering indexes for newly introduced foreign keys and removes redundant SELECT policies.

create index if not exists admin_notifications_assigned_to_idx on public.admin_notifications(assigned_to);
create index if not exists admin_notifications_resolved_by_idx on public.admin_notifications(resolved_by);
create index if not exists direct_hire_converted_work_request_idx on public.direct_hire_requests(converted_work_request_id);
create index if not exists email_templates_updated_by_idx on public.email_templates(updated_by);
create index if not exists profile_admin_notes_author_idx on public.profile_admin_notes(author_id);
create index if not exists profile_admin_notes_profile_idx on public.profile_admin_notes(profile_id);
create index if not exists verification_documents_request_idx on public.verification_documents(request_id);
create index if not exists work_request_files_uploader_idx on public.work_request_files(uploader_id);

-- The ALL policies below already cover SELECT for authorized administrators,
-- so the additional read-only policies only add duplicate permissive checks.
drop policy if exists "admin notifications read" on public.admin_notifications;
drop policy if exists "email templates admin read" on public.email_templates;
