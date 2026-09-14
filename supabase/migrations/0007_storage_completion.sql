-- Complete private storage layout and portfolio visibility.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('avatars','avatars',false,10485760,array['image/jpeg','image/png','image/webp']),
('verification-documents','verification-documents',false,20971520,array['application/pdf','image/jpeg','image/png','image/webp']),
('dispute-evidence','dispute-evidence',false,52428800,null)
on conflict(id) do nothing;

create policy "portfolio verified or owner read" on storage.objects for select to authenticated using (
  bucket_id='portfolio' and (
    (storage.foldername(name))[1]=(select auth.uid())::text
    or exists(select 1 from public.individual_profiles i where i.profile_id::text=(storage.foldername(name))[1] and i.verification_status='verified')
    or exists(select 1 from public.team_profiles t where t.profile_id::text=(storage.foldername(name))[1] and t.verification_status='verified')
  )
);
create policy "portfolio owner update" on storage.objects for update to authenticated
  using(bucket_id='portfolio' and (storage.foldername(name))[1]=(select auth.uid())::text)
  with check(bucket_id='portfolio' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "portfolio owner delete" on storage.objects for delete to authenticated
  using(bucket_id='portfolio' and (storage.foldername(name))[1]=(select auth.uid())::text);

create policy "avatar owner manage" on storage.objects for all to authenticated
  using(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text)
  with check(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "avatar authenticated read" on storage.objects for select to authenticated using(bucket_id='avatars');

create policy "verification document owner insert" on storage.objects for insert to authenticated
  with check(bucket_id='verification-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "verification document owner read" on storage.objects for select to authenticated using(
  bucket_id='verification-documents' and (
    (storage.foldername(name))[1]=(select auth.uid())::text
    or public.has_permission('verification.approve')
  )
);

create policy "dispute evidence participant insert" on storage.objects for insert to authenticated with check(
  bucket_id='dispute-evidence'
  and exists(
    select 1 from public.disputes d join public.projects p on p.id=d.project_id
    where d.id::text=(storage.foldername(name))[1] and ((select auth.uid())=p.client_id or (select auth.uid())=p.talent_id)
  )
);
create policy "dispute evidence participant read" on storage.objects for select to authenticated using(
  bucket_id='dispute-evidence'
  and (
    exists(
      select 1 from public.disputes d join public.projects p on p.id=d.project_id
      where d.id::text=(storage.foldername(name))[1] and ((select auth.uid())=p.client_id or (select auth.uid())=p.talent_id)
    )
    or public.has_permission('disputes.manage')
  )
);
