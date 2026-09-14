-- Provision the immutable public identity immediately after an Auth signup.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare requested public.account_type;
begin
  requested := coalesce((new.raw_user_meta_data->>'account_type')::public.account_type, 'client');
  insert into public.profiles(id,account_type,display_name,locale)
  values(new.id,requested,coalesce(nullif(new.raw_user_meta_data->>'display_name',''),split_part(new.email,'@',1)),coalesce(new.raw_user_meta_data->>'locale','en'));
  if requested='individual' then insert into public.individual_profiles(profile_id,email_private) values(new.id,new.email);
  elsif requested='team' then insert into public.team_profiles(profile_id,team_name) values(new.id,coalesce(nullif(new.raw_user_meta_data->>'display_name',''),'New team'));
  else insert into public.client_profiles(profile_id,full_name,country_code) values(new.id,coalesce(nullif(new.raw_user_meta_data->>'display_name',''),'New client'),'ZZ');
  end if;
  return new;
exception when invalid_text_representation then raise exception 'Invalid account type';
end$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create policy "profile detail owner" on profile_details for all using(profile_id=auth.uid()) with check(profile_id=auth.uid());
create policy "portfolio owner write" on portfolios for insert with check(profile_id=auth.uid());
create policy "portfolio owner update" on portfolios for update using(profile_id=auth.uid()) with check(profile_id=auth.uid());
create policy "portfolio owner delete" on portfolios for delete using(profile_id=auth.uid());
create policy "portfolio media through owner" on portfolio_media for all using(exists(select 1 from portfolios p where p.id=portfolio_id and p.profile_id=auth.uid())) with check(exists(select 1 from portfolios p where p.id=portfolio_id and p.profile_id=auth.uid()));
create policy "own drafts" on profile_drafts for all using(profile_id=auth.uid()) with check(profile_id=auth.uid());
create policy "talent verification requests" on verification_requests for select using(profile_id=auth.uid() or has_permission('verification.approve'));
create policy "talent request verification" on verification_requests for insert with check(profile_id=auth.uid());
create policy "officer reviews verification" on verification_requests for update using(has_permission('verification.approve'));
create policy "appointment visibility" on appointments for select using(request_id is null or exists(select 1 from verification_requests v where v.id=request_id and v.profile_id=auth.uid()) or has_permission('appointments.manage'));
create policy "book own appointment" on appointments for update using(status='available' and request_id is null) with check(exists(select 1 from verification_requests v where v.id=request_id and v.profile_id=auth.uid()));
create policy "admin appointments" on appointments for all using(has_permission('appointments.manage')) with check(has_permission('appointments.manage'));
create policy "client owns requests" on work_requests for all using(client_id=auth.uid()) with check(client_id=auth.uid());
create policy "talent sees published requests" on work_requests for select to authenticated using(status='published' and visibility='public');
create policy "talent submits offers" on offers for insert with check(talent_id=auth.uid() and exists(select 1 from profiles p where p.id=auth.uid() and p.account_type in('individual','team') and p.account_status='active'));
create policy "talent updates offers" on offers for update using(talent_id=auth.uid()) with check(talent_id=auth.uid());
create policy "favorites owner" on favorites for all using(client_id=auth.uid()) with check(client_id=auth.uid());
create policy "project party deliveries" on project_deliveries for select using(exists(select 1 from projects p where p.id=project_id and auth.uid() in(p.client_id,p.talent_id)) or has_permission('projects.read'));
create policy "talent submits deliveries" on project_deliveries for insert with check(exists(select 1 from projects p where p.id=project_id and p.talent_id=auth.uid() and p.status in('funded','in_progress')));
create policy "dispute parties read" on disputes for select using(exists(select 1 from projects p where p.id=project_id and auth.uid() in(p.client_id,p.talent_id)) or has_permission('disputes.manage'));
create policy "dispute parties open" on disputes for insert with check(opened_by=auth.uid() and exists(select 1 from projects p where p.id=project_id and auth.uid() in(p.client_id,p.talent_id)));
create policy "dispute manager decision" on disputes for update using(has_permission('disputes.manage'));
create policy "appeal party" on appeals for insert with check(submitted_by=auth.uid() and exists(select 1 from disputes d join projects p on p.id=d.project_id where d.id=dispute_id and auth.uid() in(p.client_id,p.talent_id) and d.decided_at >= now()-interval '12 hours'));
create policy "reviews project parties" on reviews for all using(author_id=auth.uid()) with check(author_id=auth.uid() and exists(select 1 from projects p where p.id=project_id and p.status in('completed','paid') and auth.uid() in(p.client_id,p.talent_id)));
create policy "team manages members" on team_members for all using(team_id=auth.uid()) with check(team_id=auth.uid());
