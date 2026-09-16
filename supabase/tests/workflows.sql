\set ON_ERROR_STOP on
begin;
create temporary table test_ids(name text primary key,id uuid);
grant all on test_ids to authenticated,service_role;
create function pg_temp.id(text) returns uuid language sql as $$select id from test_ids where name=$1$$;
create function pg_temp.ok(condition boolean,label text) returns void language plpgsql as $$begin if condition is not true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end$$;
create function pg_temp.denied(statement text,label text) returns void language plpgsql as $$declare caught boolean:=false; begin begin execute statement; exception when others then caught:=true; end; perform pg_temp.ok(caught,label); end$$;
insert into test_ids values
 ('client','11111111-1111-4111-8111-111111111111'),('talent','22222222-2222-4222-8222-222222222222'),
 ('competitor','33333333-3333-4333-8333-333333333333'),('admin','44444444-4444-4444-8444-444444444444'),
 ('new','55555555-5555-4555-8555-555555555555');
insert into auth.users(id,email,raw_user_meta_data)
select id,name||'@test.invalid',jsonb_build_object('account_type',case when name in('client','admin') then 'client' else 'individual' end,'display_name','Test '||name) from test_ids;
select pg_temp.ok((select count(*)=5 from public.profiles),'registration provisions immutable account types');
insert into public.admin_roles(profile_id,role_id) select pg_temp.id('admin'),id from public.roles where name='Super Admin';
update public.individual_profiles set verification_status='verified',professional_title='Designer',bio='Synthetic fixture only',gaza_location='Gaza',legal_name='PRIVATE REAL IDENTITY',email_private='private@test.invalid' where profile_id in(pg_temp.id('talent'),pg_temp.id('competitor'));
insert into public.work_requests(id,client_id,title,description,budget_min_minor,budget_max_minor,currency,visibility,status)
select gen_random_uuid(),pg_temp.id('client'),'Project '||n,'A sufficiently descriptive test project request.',100000,100000,'USD','public','published' from generate_series(1,3)n;
insert into test_ids select title,id from public.work_requests;
insert into public.offers(work_request_id,talent_id,price_minor,currency,delivery_days,proposal,scope)
select id,pg_temp.id('talent'),100000,'USD',5,'A complete proposal','Deliver the agreed work' from public.work_requests;
insert into test_ids select 'offer '||w.title,o.id from public.offers o join public.work_requests w on w.id=o.work_request_id;
insert into public.offers(work_request_id,talent_id,price_minor,currency,delivery_days,proposal,scope) values(pg_temp.id('Project 1'),pg_temp.id('competitor'),90000,'USD',4,'A competing offer','Same requested work');
set local role authenticated;
select set_config('request.jwt.claim.sub',pg_temp.id('new')::text,true);
select pg_temp.denied($q$update public.individual_profiles set verification_status='verified' where profile_id=auth.uid()$q$,'self verification forbidden');
select pg_temp.denied($q$update public.profiles set account_type='client' where id=auth.uid()$q$,'account type immutable');
select pg_temp.denied($q$update public.profiles set account_status='banned' where id=auth.uid()$q$,'account status protected');
select pg_temp.denied($q$select public.gw_accept_offer(pg_temp.id('client'),pg_temp.id('offer Project 1'))$q$,'public API cannot impersonate RPC actor');
select pg_temp.denied($q$insert into public.offers(work_request_id,talent_id,price_minor,currency,delivery_days,proposal,scope) values(pg_temp.id('Project 1'),auth.uid(),1,'USD',1,'Bad proposal','Bad scope')$q$,'unverified offers blocked');
select set_config('request.jwt.claim.sub',pg_temp.id('client')::text,true);
select pg_temp.ok((select count(*)=0 from public.individual_profiles),'directory cannot read legal identities');
select pg_temp.denied($q$select internal_notes from public.verification_requests$q$,'verification notes private');
select pg_temp.denied($q$select internal_notes from public.appointments$q$,'appointment notes private');
select set_config('request.jwt.claim.sub',pg_temp.id('competitor')::text,true);
select pg_temp.ok((select count(*)=1 from public.offers),'competitor sees only own price');
select pg_temp.ok(not public.has_permission('payouts.approve'),'normal user has no finance role');
set local role service_role;
insert into test_ids select 'p1',(public.gw_accept_offer(pg_temp.id('client'),pg_temp.id('offer Project 1'))->>'projectId')::uuid;
select pg_temp.ok((public.gw_accept_offer(pg_temp.id('client'),pg_temp.id('offer Project 1'))->>'projectId')::uuid=pg_temp.id('p1'),'offer acceptance idempotent');
select pg_temp.ok((select count(*)=1 from public.project_agreements where project_id=pg_temp.id('p1')),'agreement committed with project');
select pg_temp.denied($q$select public.gw_submit_delivery(pg_temp.id('talent'),pg_temp.id('p1'),'Final work')$q$,'unfunded delivery blocked');
insert into test_ids select 'tx1',(public.gw_mock_fund(pg_temp.id('client'),pg_temp.id('p1'),2500)->>'transactionId')::uuid;
select pg_temp.ok((public.gw_mock_fund(pg_temp.id('client'),pg_temp.id('p1'),2500)->>'transactionId')::uuid=pg_temp.id('tx1'),'funding idempotent');
select pg_temp.ok((select worker_entitlement_minor=93000 and platform_deduction_minor=7000 and platform_revenue_minor=4500 from public.transactions where id=pg_temp.id('tx1')),'7 percent includes actual gateway fee');
select pg_temp.ok((select sum(case direction when 'debit' then amount_minor else -amount_minor end)=0 from public.ledger_entries where transaction_id=pg_temp.id('tx1')),'funding journal balances');
insert into test_ids select 'room1',id from public.chat_rooms where project_id=pg_temp.id('p1');
select pg_temp.ok(public.gw_send_message(pg_temp.id('talent'),pg_temp.id('room1'),'٠٥٩')->>'status'='pending_moderation','Arabic contact fragment held before delivery');
select public.gw_send_message(pg_temp.id('talent'),pg_temp.id('room1'),'١٢٣');
select pg_temp.ok(public.gw_send_message(pg_temp.id('talent'),pg_temp.id('room1'),'٤٥٦٧')->>'status'='pending_moderation','rolling Arabic phone detection');
select pg_temp.ok((select count(*)=3 from public.message_moderation),'moderation queue atomic');
set local role authenticated;
select set_config('request.jwt.claim.sub',pg_temp.id('client')::text,true);
select pg_temp.ok((select count(*)=0 from public.chat_messages),'recipient cannot read held messages');
select pg_temp.ok((select count(*)=2 from public.chat_participants where room_id=pg_temp.id('room1')),'chat membership RLS is nonrecursive');
select pg_temp.denied($q$insert into public.chat_messages(room_id,sender_id,body,message_type,status) values(pg_temp.id('room1'),auth.uid(),'mail@test.invalid','text','delivered')$q$,'direct message insert cannot bypass moderation');
set local role service_role;
select public.gw_submit_delivery(pg_temp.id('talent'),pg_temp.id('p1'),'Final deliverables attached.');
insert into test_ids select 'd1',(public.gw_open_dispute(pg_temp.id('client'),pg_temp.id('p1'),'The submitted work is missing scope.')->>'id')::uuid;
select pg_temp.denied($q$select public.gw_review_delivery(pg_temp.id('client'),pg_temp.id('p1'),'accept')$q$,'dispute blocks delivery acceptance');
update public.project_deliveries set auto_accept_at=now()-interval '1 hour' where project_id=pg_temp.id('p1');
select public.gw_run_timers();
select pg_temp.ok((select count(*)=0 from public.payouts),'dispute pauses automatic release');
select public.gw_decide_dispute(pg_temp.id('admin'),pg_temp.id('d1'),'split',60000,40000,'Based on the preserved project evidence.');
insert into test_ids select 'appeal1',(public.gw_appeal(pg_temp.id('talent'),pg_temp.id('d1'),'Additional relevant evidence for review.')->>'id')::uuid;
select pg_temp.denied($q$select public.gw_appeal(pg_temp.id('client'),pg_temp.id('d1'),'Second appeal with additional evidence.')$q$,'one appeal only across both parties');
select public.gw_decide_appeal(pg_temp.id('admin'),pg_temp.id('appeal1'),60000,40000,'Final decision based on the additional evidence.');
select pg_temp.ok((select amount_minor=55800 from public.payouts where transaction_id=pg_temp.id('tx1')),'settlement applies fee once to awarded work');
select pg_temp.ok((select gross_minor=100000 and refund_due_minor=40000 from public.transactions where id=pg_temp.id('tx1')),'original gross retained and refund obligation recorded');
select pg_temp.ok((select sum(case direction when 'debit' then amount_minor else -amount_minor end)=0 from public.ledger_entries where transaction_id=pg_temp.id('tx1')),'settlement journal balances');
select pg_temp.denied($q$select public.gw_decide_appeal(pg_temp.id('admin'),pg_temp.id('appeal1'),60000,40000,'Attempt to change the final decision.')$q$,'appeal decision final');
insert into test_ids select 'po1',id from public.payouts where transaction_id=pg_temp.id('tx1');
select pg_temp.denied($q$select public.gw_update_payout(pg_temp.id('admin'),pg_temp.id('po1'),'paid')$q$,'payout cannot skip approval and processing');
select public.gw_update_payout(pg_temp.id('admin'),pg_temp.id('po1'),'approved');
select public.gw_update_payout(pg_temp.id('admin'),pg_temp.id('po1'),'processing');
select pg_temp.denied($q$select public.gw_update_payout(pg_temp.id('admin'),pg_temp.id('po1'),'paid')$q$,'payout requires transfer evidence reference');
select public.gw_update_payout(pg_temp.id('admin'),pg_temp.id('po1'),'paid','Test destination','Test-only reference');
select pg_temp.ok((select sum(case direction when 'debit' then amount_minor else -amount_minor end)=0 from public.ledger_entries where transaction_id=pg_temp.id('tx1')),'paid journal balances');
-- A revised old delivery must never be accepted by the timer.
insert into test_ids select 'p2',(public.gw_accept_offer(pg_temp.id('client'),pg_temp.id('offer Project 2'))->>'projectId')::uuid;
select public.gw_mock_fund(pg_temp.id('client'),pg_temp.id('p2'));
select public.gw_submit_delivery(pg_temp.id('talent'),pg_temp.id('p2'),'First delivery needing revision.');
select public.gw_review_delivery(pg_temp.id('client'),pg_temp.id('p2'),'request_revision');
update public.project_deliveries set auto_accept_at=now()-interval '4 days' where project_id=pg_temp.id('p2');
select public.gw_run_timers();
select pg_temp.ok((select status='in_progress' from public.projects where id=pg_temp.id('p2')),'timer skips revised deliveries');

select pg_temp.denied($q$select public.gw_submit_delivery(pg_temp.id('talent'),pg_temp.id('p2'),'Delivery with fabricated attachment',array['bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb']::uuid[])$q$,'missing delivery attachment cannot start review timer');
select pg_temp.ok((select status='in_progress' from public.projects where id=pg_temp.id('p2')),'failed delivery preserves in-progress project');
insert into storage.objects(bucket_id,name,metadata) values('project-files',pg_temp.id('p2')::text||'/'||pg_temp.id('talent')::text||'/final.pdf','{"mimetype":"application/pdf","size":456}');
insert into public.project_files(id,project_id,uploader_id,storage_path,mime_type,size_bytes) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',pg_temp.id('p2'),pg_temp.id('talent'),pg_temp.id('p2')::text||'/'||pg_temp.id('talent')::text||'/final.pdf','application/pdf',456);
select public.gw_submit_delivery(pg_temp.id('talent'),pg_temp.id('p2'),'Corrected final delivery.',array['bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb']::uuid[]);
select pg_temp.ok((select delivery_id is not null from public.project_files where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),'delivery commits with already-uploaded attachments');

update public.project_deliveries set auto_accept_at=now()-interval '1 minute' where project_id=pg_temp.id('p2') and revision_requested_at is null;
select public.gw_run_timers();
select public.gw_run_timers();
select pg_temp.ok((select count(*)=1 from public.payouts po join public.transactions t on t.id=po.transaction_id where t.project_id=pg_temp.id('p2')),'72-hour acceptance creates only one payout');
-- Verification requires documents and a completed in-person interview.
select pg_temp.denied($q$select public.gw_request_verification(pg_temp.id('new'))$q$,'incomplete profile cannot request verification');
update public.profiles set onboarding_complete=true where id=pg_temp.id('new');
update public.individual_profiles set professional_title='Developer',bio='A complete professional summary',gaza_location='Gaza' where profile_id=pg_temp.id('new');
select pg_temp.denied($q$select public.gw_request_verification(pg_temp.id('new'))$q$,'verification requires documents');
insert into storage.objects(bucket_id,name,metadata) values('verification-documents',pg_temp.id('new')::text||'/fixture.pdf','{"mimetype":"application/pdf","size":123}');
insert into public.verification_documents(profile_id,storage_path,mime_type,label) values(pg_temp.id('new'),pg_temp.id('new')::text||'/fixture.pdf','application/pdf','Synthetic document');
insert into test_ids select 'verification',(public.gw_request_verification(pg_temp.id('new'))->>'id')::uuid;
select pg_temp.denied($q$select public.gw_verify(pg_temp.id('admin'),pg_temp.id('verification'),'verified')$q$,'verification cannot skip interview');
insert into public.appointments(starts_at,ends_at,status,internal_notes) values(now()+interval '1 day',now()+interval '25 hours','available','PRIVATE STAFF NOTES') returning id as slot \gset
insert into test_ids values('slot',:'slot');
select public.gw_book_appointment(pg_temp.id('new'),pg_temp.id('slot'),pg_temp.id('verification'));
select pg_temp.denied($q$select public.gw_book_appointment(pg_temp.id('new'),pg_temp.id('slot'),pg_temp.id('verification'))$q$,'appointment cannot be double booked');
update public.appointments set status='completed' where id=pg_temp.id('slot');
select public.gw_verify(pg_temp.id('admin'),pg_temp.id('verification'),'verified');
select pg_temp.ok((select verification_status='verified' from public.individual_profiles where profile_id=pg_temp.id('new')),'verification status synchronized');
select pg_temp.denied($q$delete from public.verification_documents where profile_id=pg_temp.id('new')$q$,'submitted verification evidence cannot be erased');
select pg_temp.denied($q$update public.profiles set avatar_path=pg_temp.id('talent')::text||'/private.png' where id=pg_temp.id('new')$q$,'avatar cannot reference another account file');
select pg_temp.denied($q$insert into public.dispute_evidence(dispute_id,submitted_by,statement) values(pg_temp.id('d1'),pg_temp.id('client'),'Attempt after final decision')$q$,'final dispute evidence remains closed');

set local role authenticated;
select set_config('request.jwt.claim.sub',pg_temp.id('client')::text,true);
insert into public.reviews(project_id,author_id,subject_id,overall) values(pg_temp.id('p2'),auth.uid(),pg_temp.id('talent'),5);
select pg_temp.ok((select count(*)=1 from public.reviews where project_id=pg_temp.id('p2')),'completed delivery may receive rating before bank payout');
select pg_temp.denied($q$insert into public.reviews(project_id,author_id,subject_id,overall) values(pg_temp.id('p1'),auth.uid(),pg_temp.id('competitor'),5)$q$,'rating cannot target an unrelated user');
-- Atomic profile updates preserve omitted fields and roll back on a bad skill.
set local role service_role;
select public.gw_save_profile(pg_temp.id('new'),'Updated professional','{"professional_title":"Software engineer","availability":"Available now"}');
select pg_temp.ok((select professional_title='Software engineer' and bio='A complete professional summary' from public.individual_profiles where profile_id=pg_temp.id('new')),'partial profile edits preserve omitted details');
select pg_temp.denied($q$select public.gw_save_profile(pg_temp.id('new'),'Uncommitted name','{}',array['00000000-0000-4000-8000-000000000000']::uuid[])$q$,'invalid skill rejects entire profile update');
select pg_temp.ok((select display_name='Updated professional' from public.profiles where id=pg_temp.id('new')),'failed profile edit leaves previous name intact');
select pg_temp.denied($q$select public.gw_save_profile(pg_temp.id('new'),null,'{"verification_status":"verified"}')$q$,'profile workflow rejects privileged fields');
insert into public.profile_drafts(id,profile_id,source_kind,source_path) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',pg_temp.id('new'),'individual',pg_temp.id('talent')::text||'/private.pdf');
select pg_temp.denied($q$select public.gw_save_profile(pg_temp.id('new'),null,'{}',null,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$q$,'draft confirmation cannot attach another persons document');
select pg_temp.ok((select confirmed_at is null from public.profile_drafts where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),'failed draft confirmation stays unconfirmed');

insert into test_ids select 'custom-role',(public.gw_create_role(pg_temp.id('admin'),'Limited editor','Synthetic fixture',array['users.read','users.edit'])->>'id')::uuid;
select public.gw_assign_role(pg_temp.id('admin'),pg_temp.id('competitor'),pg_temp.id('custom-role'),'assign');
select pg_temp.denied($q$select public.gw_admin_user(pg_temp.id('competitor'),pg_temp.id('new'),null,'banned')$q$,'user editor cannot ban without users.ban permission');
select public.gw_admin_user(pg_temp.id('competitor'),pg_temp.id('new'),'Admin edited name');
select pg_temp.ok((select display_name='Admin edited name' from public.profiles where id=pg_temp.id('new')),'custom role permits only its granted action');
select pg_temp.denied($q$select public.gw_assign_role(pg_temp.id('competitor'),pg_temp.id('new'),pg_temp.id('custom-role'),'assign')$q$,'non-owner cannot assign roles');
select pg_temp.denied($q$select public.gw_create_role(pg_temp.id('admin'),'Invalid role','Fixture',array['unknown.permission'])$q$,'unknown permission rolls back role creation');
select pg_temp.ok((select count(*)=0 from public.roles where name='Invalid role'),'failed role creation leaves no empty role');
select pg_temp.denied($q$select public.gw_admin_user(pg_temp.id('admin'),pg_temp.id('admin'),null,'suspended')$q$,'administrator cannot disable own account');
select pg_temp.ok(public.gw_analytics(pg_temp.id('competitor'))->'finances'='null'::jsonb,'non-financial administrator cannot see money totals');
select pg_temp.ok((public.gw_analytics(pg_temp.id('admin'))->'finances'->0->>'payout_obligation_minor')::bigint=93000,'analytics excludes already paid worker entitlements');
update public.work_requests set currency='EUR' where id=pg_temp.id('Project 3');
update public.offers set currency='EUR' where id=pg_temp.id('offer Project 3');
insert into test_ids select 'p3',(public.gw_accept_offer(pg_temp.id('client'),pg_temp.id('offer Project 3'))->>'projectId')::uuid;
select public.gw_mock_fund(pg_temp.id('client'),pg_temp.id('p3'));
select pg_temp.ok(jsonb_array_length(public.gw_analytics(pg_temp.id('admin'))->'finances')=2,'financial analytics never combine different currencies');
select pg_temp.ok((public.gw_analytics(pg_temp.id('admin'),now()+interval '1 day')->>'totalUsers')::int=0,'analytics applies registration date filter');
select public.gw_update_payout(pg_temp.id('admin'),pg_temp.id('po1'),'paid','Test destination','Test-only reference');
select pg_temp.ok((select count(*)=1 from public.ledger_entries where transaction_id=pg_temp.id('tx1') and account='provider_cash' and direction='credit'),'payout completion retry cannot post a second transfer');

reset role;
update public.profiles set account_status='suspended' where id=pg_temp.id('admin');
set local role authenticated;
select set_config('request.jwt.claim.sub',pg_temp.id('admin')::text,true);
select pg_temp.ok(not public.has_permission('*'),'suspended administrator loses permissions');
reset role;
select pg_temp.ok(not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity),'all public tables enable row level security');
select pg_temp.ok(not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'gw_%' and has_function_privilege('authenticated',p.oid,'execute')),'privileged workflows cannot be called by public authenticated API');
select pg_temp.ok((select count(*)=6 from public.skill_translations st join public.skills s on s.id=st.skill_id where s.slug='translation'),'fresh seed supplies all six taxonomy locales');
select pg_temp.ok(exists(select 1 from public.roles r join public.role_permissions rp on rp.role_id=r.id where r.name='Moderator' and rp.permission_key='reviews.moderate'),'fresh seed grants operational moderator permissions');
set constraints all immediate;
select pg_temp.ok(true,'all deferred ledger constraints pass');
rollback;
