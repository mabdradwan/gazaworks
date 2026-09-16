-- All marketplace state transitions commit together. Only trusted server code may
-- invoke these RPCs; actor identity is taken from Supabase Auth in the API layer.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create function private.active_account() returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles where id=auth.uid() and account_status='active')
$$;
create function private.room_member(room uuid) returns boolean language sql stable security definer set search_path='' as $$
  select private.active_account() and exists(select 1 from public.chat_participants where room_id=room and profile_id=auth.uid())
$$;
create function private.verified_talent(talent uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles p where p.id=talent and p.account_status='active' and
    (exists(select 1 from public.individual_profiles i where i.profile_id=p.id and i.verification_status='verified') or
     exists(select 1 from public.team_profiles t where t.profile_id=p.id and t.verification_status='verified')))
$$;
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.active_account(),private.room_member(uuid),private.verified_talent(uuid) to authenticated,service_role;

create or replace function public.has_permission(required text) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.admin_roles ar join public.role_permissions rp on rp.role_id=ar.role_id join public.profiles p on p.id=ar.profile_id
  where ar.profile_id=auth.uid() and p.account_status='active' and (rp.permission_key=required or rp.permission_key='*'))
$$;
revoke execute on function public.has_permission(text) from public,anon;
grant execute on function public.has_permission(text) to authenticated,service_role;

create function private.require_actor(actor uuid, permission text default null) returns void language plpgsql set search_path='' as $$
begin
  if actor is null or not exists(select 1 from public.profiles where id=actor and account_status='active') then
    raise exception 'inactive_account' using errcode='42501';
  end if;
  if permission is not null and not exists(select 1 from public.admin_roles ar join public.role_permissions rp on rp.role_id=ar.role_id where ar.profile_id=actor and rp.permission_key in(permission,'*')) then
    raise exception 'forbidden' using errcode='42501';
  end if;
  perform set_config('request.jwt.claim.sub',actor::text,true);
end$$;

-- Account suspension must also hold when a client bypasses application routes.
do $$declare t text; begin
  foreach t in array array['profiles','individual_profiles','team_profiles','client_profiles','team_members','profile_skills','profile_details','portfolios','portfolio_media','profile_drafts','verification_requests','appointments','work_requests','work_request_skills','work_request_invites','offers','projects','project_agreements','project_deliveries','project_files','chat_rooms','chat_participants','chat_messages','message_moderation','transactions','payments','ledger_entries','payouts','disputes','dispute_evidence','appeals','reviews','favorites','notifications','ai_interactions','direct_hire_requests','verification_documents','work_request_files','portfolio_skills'] loop
    execute format('create policy active_account_required on public.%I as restrictive for all to authenticated using(private.active_account()) with check(private.active_account())',t);
  end loop;
end$$;

-- Private identity records are available to their owner and authorized staff only.
-- The client directory uses a server-side allowlist of professional fields.
drop policy "authenticated verified talent directory" on public.individual_profiles;
drop policy "authenticated verified teams" on public.team_profiles;
drop policy "verified team public members" on public.team_members;
create policy "identity owner staff" on public.individual_profiles for select to authenticated using(profile_id=auth.uid() or public.has_permission('users.read') or public.has_permission('verification.approve'));
create policy "team identity owner staff" on public.team_profiles for select to authenticated using(profile_id=auth.uid() or public.has_permission('users.read') or public.has_permission('verification.approve'));
create policy "member identity owner staff" on public.team_members for select to authenticated using(team_id=auth.uid() or public.has_permission('users.read') or public.has_permission('verification.approve'));
revoke delete on public.individual_profiles,public.team_profiles,public.profiles from authenticated;

create function private.guard_profile_fields() returns trigger language plpgsql set search_path='' as $$
begin
  if current_user in('authenticated','anon') then
    if tg_table_name='profiles' and new.account_status is distinct from old.account_status then raise exception 'protected_account_status' using errcode='42501'; end if;
    if tg_table_name<>'profiles' then
      if tg_op='INSERT' then
        if new.verification_status<>'draft' or new.featured then raise exception 'protected_verification' using errcode='42501'; end if;
      elsif new.verification_status is distinct from old.verification_status or new.featured is distinct from old.featured or new.profile_id<>old.profile_id then
        raise exception 'protected_verification' using errcode='42501';
      end if;
      if not exists(select 1 from public.profiles where id=new.profile_id and account_type::text=case tg_table_name when 'individual_profiles' then 'individual' else 'team' end) then raise exception 'wrong_account_type'; end if;
    end if;
  end if;
  return new;
end$$;
create trigger protected_profile_fields before update on public.profiles for each row execute function private.guard_profile_fields();
create trigger protected_individual_fields before insert or update on public.individual_profiles for each row execute function private.guard_profile_fields();
create trigger protected_team_fields before insert or update on public.team_profiles for each row execute function private.guard_profile_fields();

-- Server-managed writes; row ownership alone cannot authorize state decisions.
revoke insert,update,delete on public.projects,public.project_agreements,public.project_deliveries,public.disputes,public.appeals,public.payouts,public.transactions,public.payments,public.ledger_entries,public.verification_requests,public.appointments,public.message_moderation,public.chat_messages from authenticated,anon;
revoke update,delete on public.offers,public.reviews from authenticated;
revoke update on public.notifications from authenticated;
grant update(read_at) on public.notifications to authenticated;
revoke select on public.verification_requests,public.appointments from authenticated;
grant select(id,profile_id,status,submitted_at,decision_reason,decided_at) on public.verification_requests to authenticated;
grant select(id,starts_at,ends_at,request_id,status,user_notes) on public.appointments to authenticated;

-- Avoid recursive RLS and keep held content out of Realtime/read responses.
drop policy "chat participants read" on public.chat_participants;
create policy "chat participants scoped read" on public.chat_participants for select to authenticated using(private.room_member(room_id) or public.has_permission('messages.review'));
drop policy "room participant messages" on public.chat_messages;
create policy "delivered or own messages" on public.chat_messages for select to authenticated using(public.has_permission('messages.review') or (private.room_member(room_id) and (sender_id=auth.uid() or status in('delivered','redacted'))));
drop policy "message storage participant read" on storage.objects;
create policy "message attachments visible" on storage.objects for select to authenticated using(bucket_id='message-files' and exists(select 1 from public.chat_messages m where m.storage_path=name and private.room_member(m.room_id) and (m.sender_id=auth.uid() or m.status in('delivered','redacted'))));

-- Private invitations must be visible without a recursive work-request policy.
create function private.invited_to(request uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.work_request_invites where work_request_id=request and profile_id=auth.uid())
$$;
revoke all on function private.invited_to(uuid) from public,anon;
grant execute on function private.invited_to(uuid) to authenticated;
drop policy "talent sees published requests" on public.work_requests;
create policy "eligible talent requests" on public.work_requests for select to authenticated using(status='published' and private.verified_talent(auth.uid()) and (visibility='public' or private.invited_to(id)));

create function private.guard_offer() returns trigger language plpgsql set search_path='' as $$
declare w public.work_requests; begin
 select * into w from public.work_requests where id=new.work_request_id;
 if w.id is null or w.status<>'published' or not private.verified_talent(new.talent_id) or new.talent_id=w.client_id or new.currency<>w.currency or new.status<>'submitted' or (w.visibility='invite_only' and not exists(select 1 from public.work_request_invites where work_request_id=w.id and profile_id=new.talent_id)) then raise exception 'offer_not_permitted' using errcode='42501'; end if;
 return new;
end$$;
create trigger validate_offer before insert on public.offers for each row execute function private.guard_offer();
create unique index one_project_per_request on public.projects(work_request_id) where work_request_id is not null;
create unique index one_payout_per_transaction on public.payouts(transaction_id);
create unique index one_pending_delivery on public.project_deliveries(project_id) where accepted_at is null and revision_requested_at is null;
create unique index one_booked_interview on public.appointments(request_id) where status='booked';
create unique index one_active_verification on public.verification_requests(profile_id) where status not in('rejected','changes_requested');
alter table public.transactions add column deduction_bps integer not null default 700 check(deduction_bps between 0 and 10000);
alter table public.transactions add column refund_due_minor bigint not null default 0 check(refund_due_minor>=0);
alter table public.transactions add column settlement_worker_due_minor bigint;
alter table public.transactions add column settlement_deduction_minor bigint;

create function public.gw_accept_offer(actor uuid, offer_id uuid) returns jsonb language plpgsql set search_path='' as $$
declare o public.offers; w public.work_requests; p uuid; room uuid; due timestamptz; begin
 perform private.require_actor(actor);
 select * into o from public.offers where id=offer_id;
 select * into w from public.work_requests where id=o.work_request_id for update;
 select * into o from public.offers where id=offer_id for update;
 if w.client_id is distinct from actor then raise exception 'forbidden' using errcode='42501'; end if;
 select id into p from public.projects where accepted_offer_id=offer_id;
 if p is not null then return jsonb_build_object('projectId',p,'roomId',(select id from public.chat_rooms where project_id=p limit 1)); end if;
 if w.status<>'published' or o.status<>'submitted' or not private.verified_talent(o.talent_id) or o.currency<>w.currency then raise exception 'offer_unavailable'; end if;
 due:=now()+o.delivery_days*interval '1 day';
 insert into public.projects(work_request_id,client_id,talent_id,accepted_offer_id,status,deadline) values(w.id,actor,o.talent_id,o.id,'awaiting_payment',due) returning id into p;
 insert into public.project_agreements(project_id,scope,price_minor,currency,deadline,accepted_at,client_snapshot,talent_snapshot,offer_snapshot)
 values(p,o.scope,o.price_minor,o.currency,due,now(),jsonb_build_object('id',actor),jsonb_build_object('id',o.talent_id),to_jsonb(o));
 insert into public.chat_rooms(project_id) values(p) returning id into room;
 insert into public.chat_participants values(room,actor),(room,o.talent_id);
 update public.offers set status=case when id=o.id then 'accepted' else 'declined' end where work_request_id=w.id;
 update public.work_requests set status='awarded' where id=w.id;
 insert into public.notifications(profile_id,category,title,body,data) values(o.talent_id,'projects','Offer accepted','Wait for funding confirmation before starting.',jsonb_build_object('projectId',p));
 return jsonb_build_object('projectId',p,'roomId',room);
end$$;

create function public.gw_mock_fund(actor uuid, project_id uuid, provider_fee bigint default 0) returns jsonb language plpgsql set search_path='' as $$
declare p public.projects; a public.project_agreements; tx uuid; bps integer; deduction bigint; worker bigint; revenue bigint; begin
 perform private.require_actor(actor);
 select * into p from public.projects where id=project_id for update;
 if p.client_id is distinct from actor then raise exception 'forbidden' using errcode='42501'; end if;
 select id into tx from public.transactions where transactions.project_id=p.id;
 if tx is not null then return jsonb_build_object('transactionId',tx,'simulated',true); end if;
 if p.status<>'awaiting_payment' then raise exception 'wrong_status'; end if;
 if not coalesce((select (value->>'mock')::boolean from public.settings where key='payment_methods'),false) then raise exception 'mock_disabled'; end if;
 select * into a from public.project_agreements where project_agreements.project_id=p.id;
 if a.id is null then raise exception 'agreement_missing'; end if;
 select coalesce((value->>'deduction_bps')::integer,700) into bps from public.settings where key='commission';
 bps:=coalesce(bps,700);
 if bps not between 0 and 10000 then raise exception 'invalid_deduction'; end if;
 deduction:=round(a.price_minor::numeric*bps/10000); worker:=a.price_minor-deduction; revenue:=deduction-provider_fee;
 if provider_fee<0 or provider_fee>deduction then raise exception 'invalid_provider_fee'; end if;
 insert into public.transactions(project_id,client_id,talent_id,gross_minor,platform_deduction_minor,provider_fee_minor,platform_revenue_minor,worker_entitlement_minor,currency,provider,provider_reference,deduction_bps)
 values(p.id,p.client_id,p.talent_id,a.price_minor,deduction,provider_fee,revenue,worker,a.currency,'mock','mock_'||gen_random_uuid(),bps) returning id into tx;
 insert into public.payments(transaction_id,status,amount_minor,provider_event_id,simulated) values(tx,'captured',a.price_minor,'mock_'||tx,true);
 -- Cash received after gateway costs + gateway expense = worker liability + fee revenue.
 insert into public.ledger_entries(transaction_id,account,direction,amount_minor,currency)
 select tx,v.account,v.direction,v.amount,a.currency from (values
 ('provider_cash','debit',a.price_minor-provider_fee),('provider_fee_expense','debit',provider_fee),
 ('worker_payable','credit',worker),('platform_fee_revenue','credit',deduction)) v(account,direction,amount) where v.amount>0;
 update public.projects set status='funded' where id=p.id;
 insert into public.notifications(profile_id,category,title,body,data) values(p.talent_id,'payments','Development payment simulation','Simulated funding only; no money was charged or secured.',jsonb_build_object('projectId',p.id,'simulated',true));
 return jsonb_build_object('transactionId',tx,'simulated',true,'workerEntitlementMinor',worker);
end$$;

create function private.require_funded(p uuid) returns public.transactions language plpgsql set search_path='' as $$
declare tx public.transactions; begin
 select * into tx from public.transactions where project_id=p;
 if tx.id is null or not exists(select 1 from public.payments where transaction_id=tx.id and status='captured' and amount_minor=tx.gross_minor) then raise exception 'payment_not_captured'; end if;
 return tx;
end$$;

create function public.gw_submit_delivery(actor uuid, project_id uuid, message text) returns jsonb language plpgsql set search_path='' as $$
declare p public.projects; d uuid; due timestamptz; begin
 perform private.require_actor(actor);
 select * into p from public.projects where id=project_id for update;
 if p.talent_id is distinct from actor then raise exception 'forbidden' using errcode='42501'; end if;
 if p.status not in('funded','in_progress') or exists(select 1 from public.disputes where disputes.project_id=p.id) then raise exception 'delivery_not_allowed'; end if;
 perform private.require_funded(p.id);
 if length(trim(message)) not between 3 and 5000 then raise exception 'invalid_message'; end if;
 insert into public.project_deliveries(project_id,message) values(p.id,message) returning id,auto_accept_at into d,due;
 update public.projects set status='client_review' where id=p.id;
 insert into public.notifications(profile_id,category,title,body,data) values(p.client_id,'projects','Work submitted','Review delivery within 72 hours.',jsonb_build_object('projectId',p.id,'deliveryId',d));
 return jsonb_build_object('id',d,'auto_accept_at',due);
end$$;

create function private.accept_delivery(p public.projects) returns void language plpgsql set search_path='' as $$
declare tx public.transactions; d uuid; begin
 if p.status<>'client_review' or exists(select 1 from public.disputes where project_id=p.id) then raise exception 'review_frozen'; end if;
 tx:=private.require_funded(p.id);
 select id into d from public.project_deliveries where project_id=p.id and accepted_at is null and revision_requested_at is null for update;
 if d is null then raise exception 'no_pending_delivery'; end if;
 update public.project_deliveries set accepted_at=now() where id=d;
 if tx.worker_entitlement_minor>0 then insert into public.payouts(transaction_id,amount_minor) values(tx.id,tx.worker_entitlement_minor) on conflict(transaction_id) do nothing; end if;
 update public.projects set status='payout_pending' where id=p.id;
 insert into public.notifications(profile_id,category,title,body,data) values(p.talent_id,'payments','Delivery accepted','Your entitlement is eligible for payout.',jsonb_build_object('projectId',p.id));
end$$;

create function public.gw_review_delivery(actor uuid, project_id uuid, action text) returns jsonb language plpgsql set search_path='' as $$
declare p public.projects; begin
 perform private.require_actor(actor);
 select * into p from public.projects where id=project_id for update;
 if p.client_id is distinct from actor then raise exception 'forbidden' using errcode='42501'; end if;
 if action='accept' and p.status='payout_pending' and not exists(select 1 from public.disputes where disputes.project_id=p.id) then return '{"ok":true}'; end if;
 if p.status<>'client_review' or exists(select 1 from public.disputes where disputes.project_id=p.id) then raise exception 'review_frozen'; end if;
 if action='accept' then perform private.accept_delivery(p);
 elsif action='request_revision' then
   update public.project_deliveries set revision_requested_at=now() where project_deliveries.project_id=p.id and accepted_at is null and revision_requested_at is null;
   if not found then raise exception 'no_pending_delivery'; end if;
   update public.projects set status='in_progress' where id=p.id;
 else raise exception 'invalid_action'; end if;
 return '{"ok":true}';
end$$;

create function public.gw_open_dispute(actor uuid, project_id uuid, reason text) returns jsonb language plpgsql set search_path='' as $$
declare p public.projects; d uuid; begin
 perform private.require_actor(actor);
 select * into p from public.projects where id=project_id for update;
 if p.id is null or actor not in(p.client_id,p.talent_id) then raise exception 'forbidden' using errcode='42501'; end if;
 if p.status not in('funded','in_progress','submitted','client_review') then raise exception 'dispute_not_allowed'; end if;
 perform private.require_funded(p.id);
 if length(trim(reason)) not between 10 and 5000 then raise exception 'invalid_reason'; end if;
 insert into public.disputes(project_id,opened_by,reason) values(p.id,actor,reason) returning id into d;
 update public.projects set status='disputed' where id=p.id;
 update public.transactions set dispute_state='open' where transactions.project_id=p.id;
 insert into public.admin_notifications(category,title,body,entity_type,entity_id,priority) values('disputes','New dispute','A project requires human review.','disputes',d::text,'high');
 return jsonb_build_object('id',d);
end$$;

create function public.gw_decide_dispute(actor uuid, dispute_id uuid, decision text, worker_award bigint, client_refund bigint, reasoning text) returns jsonb language plpgsql set search_path='' as $$
declare p public.projects; d public.disputes; tx public.transactions; begin
 perform private.require_actor(actor,'disputes.manage');
 select * into p from public.projects where id=(select project_id from public.disputes where id=dispute_id) for update;
 select * into d from public.disputes where id=dispute_id for update;
 if d.id is null or d.status<>'open' or actor in(p.client_id,p.talent_id) then raise exception 'decision_not_allowed'; end if;
 tx:=private.require_funded(p.id);
 if worker_award<0 or client_refund<0 or worker_award+client_refund<>tx.gross_minor or length(trim(reasoning))<10 or decision not in('worker_full','client_full','split') or (decision='worker_full' and client_refund<>0) or (decision='client_full' and worker_award<>0) then raise exception 'invalid_settlement'; end if;
 update public.disputes set status='decided',decision=gw_decide_dispute.decision,worker_award_minor=worker_award,client_refund_minor=client_refund,reasoning=gw_decide_dispute.reasoning,decided_by=actor,decided_at=now() where id=d.id;
 update public.projects set status='appeal' where id=p.id;
 update public.transactions set dispute_state='decided' where id=tx.id;
 return '{"ok":true}';
end$$;

create function public.gw_appeal(actor uuid, dispute_id uuid, reasoning text) returns jsonb language plpgsql set search_path='' as $$
declare p public.projects; d public.disputes; a uuid; begin
 perform private.require_actor(actor);
 select * into p from public.projects where id=(select project_id from public.disputes where id=dispute_id) for update;
 select * into d from public.disputes where id=dispute_id for update;
 if p.id is null or actor not in(p.client_id,p.talent_id) then raise exception 'forbidden' using errcode='42501'; end if;
 if d.status<>'decided' or now()<d.decided_at or now()>=d.decided_at+interval '12 hours' or length(trim(reasoning))<10 then raise exception 'appeal_window_closed'; end if;
 insert into public.appeals(dispute_id,submitted_by,reasoning) values(d.id,actor,reasoning) returning id into a;
 update public.transactions set dispute_state='appeal' where transactions.project_id=p.id;
 insert into public.admin_notifications(category,title,body,entity_type,entity_id,priority) values('appeals','Appeal submitted','Additional evidence requires human review.','appeals',a::text,'high');
 return jsonb_build_object('id',a);
end$$;

-- A settlement records refund obligations. It never claims a bank refund occurred.
create function private.finalize_dispute(d public.disputes) returns void language plpgsql set search_path='' as $$
declare tx public.transactions; deduction bigint; worker bigint; begin
 tx:=private.require_funded(d.project_id);
 if d.worker_award_minor is null or d.client_refund_minor is null or d.worker_award_minor+d.client_refund_minor<>tx.gross_minor then raise exception 'invalid_settlement'; end if;
 deduction:=round(d.worker_award_minor::numeric*tx.deduction_bps/10000); worker:=d.worker_award_minor-deduction;
 -- Reverse original liabilities/revenue, then allocate the adjudicated amounts.
 insert into public.ledger_entries(transaction_id,account,direction,amount_minor,currency)
 select tx.id,v.account,v.direction,v.amount,tx.currency from (values
 ('worker_payable','debit',tx.worker_entitlement_minor),('platform_fee_revenue','debit',tx.platform_deduction_minor),
 ('worker_payable','credit',worker),('platform_fee_revenue','credit',deduction),('client_refund_payable','credit',d.client_refund_minor)) v(account,direction,amount) where v.amount>0;
 update public.transactions set dispute_state='resolved',refund_due_minor=d.client_refund_minor,settlement_worker_due_minor=worker,settlement_deduction_minor=deduction where id=tx.id;
 -- Keep the original transaction snapshot for reconciliation.
 if worker>0 then insert into public.payouts(transaction_id,amount_minor) values(tx.id,worker) on conflict(transaction_id) do update set amount_minor=excluded.amount_minor,status='pending'; end if;
 update public.disputes set status='final' where id=d.id;
 update public.projects set status=case when worker>0 then 'payout_pending'::public.project_status else 'cancelled'::public.project_status end where id=d.project_id;
 if d.client_refund_minor>0 then insert into public.admin_notifications(category,title,body,entity_type,entity_id,priority) values('payments','Refund pending','Record and reconcile the provider refund before marking it paid.','transactions',tx.id::text,'high'); end if;
end$$;

create function public.gw_decide_appeal(actor uuid, appeal_id uuid, worker_award bigint, client_refund bigint, reasoning text) returns jsonb language plpgsql set search_path='' as $$
declare a public.appeals; d public.disputes; p public.projects; tx public.transactions; begin
 perform private.require_actor(actor,'disputes.manage');
 select * into a from public.appeals where id=appeal_id;
 select * into p from public.projects where id=(select project_id from public.disputes where id=a.dispute_id) for update;
 select * into d from public.disputes where id=a.dispute_id for update;
 select * into a from public.appeals where id=appeal_id for update;
 if a.id is null or a.status<>'open' or d.status<>'decided' or actor in(p.client_id,p.talent_id) then raise exception 'appeal_not_open'; end if;
 tx:=private.require_funded(p.id);
 if worker_award<0 or client_refund<0 or worker_award+client_refund<>tx.gross_minor or length(trim(reasoning))<10 then raise exception 'invalid_settlement'; end if;
 update public.appeals set status='decided',final_decision=gw_decide_appeal.reasoning,decided_by=actor,decided_at=now() where id=a.id;
 update public.disputes set worker_award_minor=worker_award,client_refund_minor=client_refund where id=d.id returning * into d;
 perform private.finalize_dispute(d);
 return '{"ok":true}';
end$$;

create function public.gw_update_payout(actor uuid, payout_id uuid, next_status public.payout_status, destination text default null, reference text default null, notes text default null) returns jsonb language plpgsql set search_path='' as $$
declare po public.payouts; p public.projects; tx public.transactions; begin
 perform private.require_actor(actor,'payouts.approve');
 select * into tx from public.transactions where id=(select transaction_id from public.payouts where id=payout_id);
 select * into p from public.projects where id=tx.project_id for update;
 select * into po from public.payouts where id=payout_id for update;
 if po.id is null or actor in(p.client_id,p.talent_id) then raise exception 'forbidden' using errcode='42501'; end if;
 if po.status=next_status then return '{"ok":true}'; end if;
 if p.status<>'payout_pending' or tx.dispute_state not in('none','resolved') or exists(select 1 from public.disputes where project_id=p.id and status<>'final') then raise exception 'payout_frozen'; end if;
 if po.status=next_status then return '{"ok":true}'; end if;
 if not ((po.status='pending' and next_status='approved') or (po.status='approved' and next_status='processing') or (po.status='processing' and next_status in('paid','failed')) or (po.status='failed' and next_status='approved')) then raise exception 'invalid_payout_transition'; end if;
 if next_status='paid' and (nullif(trim(coalesce(reference,po.transfer_reference)), '') is null or nullif(trim(coalesce(destination,po.destination_private)), '') is null) then raise exception 'payout_reference_required'; end if;
 update public.payouts set status=next_status,destination_private=coalesce(destination,destination_private),transfer_reference=coalesce(reference,transfer_reference),notes=coalesce(gw_update_payout.notes,payouts.notes),approved_by=actor,payout_date=case when next_status='paid' then current_date else payout_date end where id=po.id;
 if next_status='paid' then
   insert into public.ledger_entries(transaction_id,account,direction,amount_minor,currency) values(tx.id,'worker_payable','debit',po.amount_minor,tx.currency),(tx.id,'provider_cash','credit',po.amount_minor,tx.currency);
   update public.projects set status='paid' where id=p.id;
 end if;
 return '{"ok":true}';
end$$;

create function public.gw_run_timers() returns jsonb language plpgsql set search_path='' as $$
declare p public.projects; d public.disputes; accepted integer:=0; finalized integer:=0; begin
 for p in select * from public.projects where status in('client_review','appeal') for update skip locked loop
   if p.status='client_review' and not exists(select 1 from public.disputes where project_id=p.id) and exists(select 1 from public.project_deliveries where project_id=p.id and accepted_at is null and revision_requested_at is null and auto_accept_at<=now()) then
     perform private.accept_delivery(p); accepted:=accepted+1;
   elsif p.status='appeal' then
     select * into d from public.disputes where project_id=p.id for update;
     if d.status='decided' and d.decided_at+interval '12 hours'<=now() and not exists(select 1 from public.appeals where dispute_id=d.id) then perform private.finalize_dispute(d); finalized:=finalized+1; end if;
   end if;
 end loop;
 return jsonb_build_object('accepted',accepted,'finalized',finalized);
end$$;

create function private.guard_review() returns trigger language plpgsql set search_path='' as $$
declare p public.projects; begin
 select * into p from public.projects where id=new.project_id;
 if p.id is null or p.status not in('completed','payout_pending','paid') or new.author_id not in(p.client_id,p.talent_id) or new.subject_id is distinct from (case when new.author_id=p.client_id then p.talent_id else p.client_id end) or exists(select 1 from public.disputes where project_id=p.id and status<>'final') or new.moderation_status<>'published' then raise exception 'review_not_allowed'; end if;
 return new;
end$$;
create trigger validate_review before insert on public.reviews for each row execute function private.guard_review();
drop policy "reviews project parties" on public.reviews;
create policy "completed project review" on public.reviews for insert to authenticated with check(author_id=auth.uid());

-- Explicit RPC privileges: no authenticated caller can impersonate an actor.
do $$declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where (n.nspname='public' and p.proname like 'gw_%') or (n.nspname='private' and p.proname not in('active_account','room_member','verified_talent','invited_to')) loop
   execute format('revoke all on function %s from public,anon,authenticated',f.signature);
   execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end$$;

create function public.gw_request_verification(actor uuid) returns jsonb language plpgsql set search_path='' as $$
declare p public.profiles; request uuid; begin
 perform private.require_actor(actor);
 select * into p from public.profiles where id=actor for update;
 if p.account_type='client' or not p.onboarding_complete then raise exception 'complete_profile_first'; end if;
 if p.account_type='individual' and not exists(select 1 from public.individual_profiles where profile_id=actor and nullif(trim(professional_title),'') is not null and nullif(trim(bio),'') is not null and nullif(trim(gaza_location),'') is not null) then raise exception 'complete_profile_first'; end if;
 if p.account_type='team' and not exists(select 1 from public.team_profiles where profile_id=actor and nullif(trim(description),'') is not null and nullif(trim(gaza_location),'') is not null and team_size>0) then raise exception 'complete_profile_first'; end if;
 if not exists(select 1 from public.verification_documents where profile_id=actor) and not exists(select 1 from public.individual_profiles where profile_id=actor and cv_path is not null) and not exists(select 1 from public.team_profiles where profile_id=actor and document_path is not null) then raise exception 'document_required'; end if;
 insert into public.verification_requests(profile_id) values(actor) returning id into request;
 update public.individual_profiles set verification_status='requested' where profile_id=actor;
 update public.team_profiles set verification_status='requested' where profile_id=actor;
 insert into public.admin_notifications(category,title,body,entity_type,entity_id) values('verification','Verification requested','Review the submitted profile and documents.','verification_requests',request::text);
 return jsonb_build_object('id',request,'status','requested');
end$$;

create function public.gw_book_appointment(actor uuid, appointment_id uuid, verification_id uuid) returns jsonb language plpgsql set search_path='' as $$
declare v public.verification_requests; a public.appointments; begin
 perform private.require_actor(actor);
 select * into v from public.verification_requests where id=verification_id for update;
 if v.profile_id is distinct from actor or v.status not in('requested','under_review','interview_required','pending') then raise exception 'verification_not_bookable'; end if;
 select * into a from public.appointments where id=appointment_id for update;
 if a.id is null or a.status<>'available' or a.request_id is not null or a.starts_at<=now() then raise exception 'slot_unavailable'; end if;
 update public.appointments set request_id=v.id,status='booked' where id=a.id;
 update public.verification_requests set status='interview_scheduled' where id=v.id;
 update public.individual_profiles set verification_status='interview_scheduled' where profile_id=actor;
 update public.team_profiles set verification_status='interview_scheduled' where profile_id=actor;
 return jsonb_build_object('id',a.id);
end$$;

create function public.gw_verify(actor uuid, verification_id uuid, next_status public.verification_status, internal_notes text default null, reason text default null) returns jsonb language plpgsql set search_path='' as $$
declare v public.verification_requests; begin
 perform private.require_actor(actor,'verification.approve');
 select * into v from public.verification_requests where id=verification_id for update;
 if v.id is null or v.profile_id=actor then raise exception 'verification_not_allowed'; end if;
 if next_status not in('under_review','interview_required','interview_scheduled','pending','verified','changes_requested','rejected','suspended') then raise exception 'invalid_status'; end if;
 if next_status='verified' and not exists(select 1 from public.appointments where request_id=v.id and status='completed') then raise exception 'completed_interview_required'; end if;
 update public.verification_requests set status=next_status,internal_notes=coalesce(gw_verify.internal_notes,verification_requests.internal_notes),decision_reason=reason,reviewer_id=actor,decided_at=case when next_status in('verified','rejected','changes_requested','suspended') then now() else decided_at end where id=v.id;
 update public.individual_profiles set verification_status=next_status where profile_id=v.profile_id;
 update public.team_profiles set verification_status=next_status where profile_id=v.profile_id;
 insert into public.notifications(profile_id,category,title,body,data) values(v.profile_id,'verification','Verification status updated','Review your verification status.',jsonb_build_object('status',next_status));
 return '{"ok":true}';
end$$;

-- Rate limiting lives in PostgreSQL, so multiple application instances share it.
create table private.rate_limits(key text primary key, count integer not null, reset_at timestamptz not null);
alter table private.rate_limits enable row level security;
grant all on private.rate_limits to service_role;
create function private.consume_rate(rate_key text, limit_count integer, seconds integer) returns void language plpgsql set search_path='' as $$
declare n integer; begin
 insert into private.rate_limits as r(key,count,reset_at) values(rate_key,1,now()+make_interval(secs=>seconds))
 on conflict(key) do update set count=case when r.reset_at<=now() then 1 else r.count+1 end,reset_at=case when r.reset_at<=now() then now()+make_interval(secs=>seconds) else r.reset_at end returning count into n;
 if n>limit_count then raise exception 'rate_limited' using errcode='P0001'; end if;
end$$;
create function public.gw_send_message(actor uuid, room_id uuid, body text default null, file_path text default null, media_type text default 'text') returns jsonb language plpgsql set search_path='' as $$
declare context text; normalized text; current_text text; held boolean; message uuid; state public.message_status; begin
 perform private.require_actor(actor);
 if not exists(select 1 from public.chat_participants where chat_participants.room_id=gw_send_message.room_id and profile_id=actor) then raise exception 'forbidden' using errcode='42501'; end if;
 -- Serialize the rolling context for this sender/room to stop concurrent splitting.
 perform pg_advisory_xact_lock(hashtextextended(actor::text||room_id::text,0));
 perform private.consume_rate('message:'||actor,30,60);
 if media_type not in('text','image','document','voice') then raise exception 'invalid_media'; end if;
 if media_type='text' and (body is null or length(trim(body)) not between 1 and 5000) then raise exception 'invalid_message'; end if;
 if media_type<>'text' and (file_path is null or file_path not like room_id::text||'/'||actor::text||'/%' or not exists(select 1 from storage.objects where bucket_id='message-files' and name=file_path)) then raise exception 'invalid_attachment'; end if;
 select string_agg(coalesce(x.body,''),' ' order by x.created_at) into context from(select m.body,m.created_at from public.chat_messages m where m.room_id=gw_send_message.room_id and sender_id=actor and created_at>now()-interval '10 minutes' order by created_at desc limit 5)x;
 current_text:=translate(lower(coalesce(body,'')),'٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹０１２３４５６７８９','012345678901234567890123456789');
 current_text:=regexp_replace(current_text,'[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]','','g');
 normalized:=translate(lower(coalesce(context,'')||' '||current_text),'٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹０１２３４５６７８９','012345678901234567890123456789');
 held:=media_type<>'text' or current_text ~ '(https?://|www\.|@|whats?app|telegram|واتساب|تلغرام|تليجرام|paypal|payoneer)' or current_text ~ '^\s*\+?[0-9 .()_-]{1,20}\s*$' or length(regexp_replace(current_text,'[^0-9]','','g'))>=9 or (current_text ~ '[0-9@]' and length(regexp_replace(normalized,'[^0-9]','','g'))>=9) or (current_text ~ '^[[:alnum:].@+-]{1,80}$' and regexp_replace(normalized,'\s','','g') ~ '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[a-z]{2,}');
 state:=case when held then 'pending_moderation'::public.message_status else 'delivered'::public.message_status end;
 insert into public.chat_messages(room_id,sender_id,body,message_type,storage_path,status) values(room_id,actor,body,media_type,file_path,state) returning id into message;
 if held then
  insert into public.message_moderation(message_id,reason,context_snapshot) values(message,case when media_type='text' then 'potential_external_contact' else 'attachment_review' end,jsonb_build_object('recentBodies',context));
  insert into public.admin_notifications(category,title,body,entity_type,entity_id,priority) values('suspicious_messages','Message awaiting review','Review within 24 hours.','chat_messages',message::text,'high');
 end if;
 return jsonb_build_object('id',message,'status',state,'created_at',now(),'notice',case when held then 'This message is awaiting review. Response target: within 24 hours.' else null end);
end$$;

create function public.gw_moderate_message(actor uuid, moderation_id uuid, decision text, replacement text default null) returns jsonb language plpgsql set search_path='' as $$
declare m public.message_moderation; begin
 perform private.require_actor(actor,'messages.review');
 select * into m from public.message_moderation where id=moderation_id for update;
 if m.id is null or m.decision is not null or decision not in('approve','reject','redact') then raise exception 'moderation_unavailable'; end if;
 if decision='redact' and (replacement is null or length(trim(replacement)) not between 1 and 5000) then raise exception 'redacted_body_required'; end if;
 if decision='redact' and exists(select 1 from public.chat_messages where id=m.message_id and storage_path is not null) then raise exception 'attachment_redaction_unsupported'; end if;
 update public.message_moderation set decision=gw_moderate_message.decision,reviewer_id=actor,reviewed_at=now(),redacted_body=replacement where id=m.id;
 update public.chat_messages set status=case decision when 'approve' then 'delivered'::public.message_status when 'reject' then 'rejected'::public.message_status else 'redacted'::public.message_status end,body=case when decision='redact' then replacement else body end where id=m.message_id;
 return '{"ok":true}';
end$$;

create function public.gw_create_work_request(actor uuid, input jsonb) returns jsonb language plpgsql set search_path='' as $$
declare w uuid; begin
 perform private.require_actor(actor);
 if not exists(select 1 from public.profiles where id=actor and account_type='client') then raise exception 'client_required'; end if;
 insert into public.work_requests(client_id,title,description,category_id,budget_min_minor,budget_max_minor,currency,visibility,status,delivery_expectations,notes)
 values(actor,input->>'title',input->>'description',(input->>'categoryId')::uuid,(input->>'budgetMin')::integer,(input->>'budgetMax')::integer,upper(input->>'currency'),input->>'visibility','published',input->>'deliveryExpectations',input->>'notes') returning id into w;
 insert into public.work_request_skills(work_request_id,skill_id) select w,value::uuid from jsonb_array_elements_text(coalesce(input->'skills','[]')) on conflict do nothing;
 return jsonb_build_object('id',w);
end$$;

-- Explicit grants must follow every new function; Postgres otherwise grants PUBLIC.
do $$declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where (n.nspname='public' and p.proname like 'gw_%') or (n.nspname='private' and p.proname not in('active_account','room_member','verified_talent','invited_to')) loop
   execute format('revoke all on function %s from public,anon,authenticated',f.signature);
   execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end$$;

create function private.directory_client() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=auth.uid() and account_type='client' and account_status='active')
$$;
revoke all on function private.directory_client() from public,anon;
grant execute on function private.directory_client() to authenticated;
drop policy "authenticated directory profile cards" on public.profiles;
create policy "verified client cards" on public.profiles for select to authenticated using(private.directory_client() and private.verified_talent(id));

create function public.gw_direct_hire(actor uuid, request_id uuid, action text) returns jsonb language plpgsql set search_path='' as $$
declare r public.direct_hire_requests; w uuid; begin
 perform private.require_actor(actor);
 select * into r from public.direct_hire_requests where id=request_id for update;
 if r.id is null or actor not in(r.client_id,r.talent_id) then raise exception 'forbidden' using errcode='42501'; end if;
 if r.status='converted' and action='accept' and actor=r.talent_id then return jsonb_build_object('ok',true,'workRequestId',r.converted_work_request_id); end if;
 if r.status<>'sent' then raise exception 'request_not_available'; end if;
 if action='withdraw' and actor=r.client_id then update public.direct_hire_requests set status='withdrawn',updated_at=now() where id=r.id;
 elsif action='decline' and actor=r.talent_id then update public.direct_hire_requests set status='declined',updated_at=now() where id=r.id;
 elsif action='accept' and actor=r.talent_id and private.verified_talent(actor) then
   insert into public.work_requests(client_id,title,description,budget_min_minor,budget_max_minor,currency,visibility,status,delivery_expectations)
   values(r.client_id,r.title,r.description,coalesce(r.budget_minor,1),coalesce(r.budget_minor,1),coalesce(r.currency,'USD'),'invite_only','published',r.desired_delivery_at::text) returning id into w;
   insert into public.work_request_invites(work_request_id,profile_id) values(w,actor);
   update public.direct_hire_requests set status='converted',converted_work_request_id=w,updated_at=now() where id=r.id;
 else raise exception 'action_not_allowed'; end if;
 return jsonb_build_object('ok',true,'workRequestId',w);
end$$;
revoke update,delete on public.direct_hire_requests from authenticated;
revoke all on function public.gw_direct_hire(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.gw_direct_hire(uuid,uuid,text) to service_role;

-- Work-request owners may edit draft/published requests, never reopen an award.
create function private.guard_request_update() returns trigger language plpgsql set search_path='' as $$
begin
 if current_user='authenticated' and (old.status='awarded' or new.client_id<>old.client_id or new.status not in('draft','published','closed','cancelled')) then raise exception 'protected_request'; end if;
 return new;
end$$;
create trigger protected_request before update on public.work_requests for each row execute function private.guard_request_update();
revoke all on function private.guard_request_update() from public,anon,authenticated;
grant execute on function private.guard_request_update() to service_role;

-- Provision the OAuth identity and its typed profile in the same transaction.
create function public.gw_provision_profile(actor uuid, kind public.account_type, display_name text, locale text, email text default null) returns jsonb language plpgsql set search_path='' as $$
declare existing public.profiles; begin
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 select * into existing from public.profiles where id=actor;
 if existing.id is not null then return jsonb_build_object('id',actor,'account_type',existing.account_type); end if;
 if length(trim(display_name)) not between 2 and 100 or locale not in('ar','en','tr','es','fr','de') then raise exception 'invalid_profile'; end if;
 insert into public.profiles(id,account_type,display_name,locale) values(actor,kind,display_name,locale);
 if kind='individual' then insert into public.individual_profiles(profile_id,email_private) values(actor,email);
 elsif kind='team' then insert into public.team_profiles(profile_id,team_name) values(actor,display_name);
 else insert into public.client_profiles(profile_id,full_name,country_code) values(actor,display_name,'ZZ'); end if;
 return jsonb_build_object('id',actor,'account_type',kind);
end$$;
revoke all on function public.gw_provision_profile(uuid,public.account_type,text,text,text) from public,anon,authenticated;
grant execute on function public.gw_provision_profile(uuid,public.account_type,text,text,text) to service_role;

create function public.gw_invite(actor uuid, request_id uuid, talent_id uuid) returns jsonb language plpgsql set search_path='' as $$
declare w public.work_requests; begin
 perform private.require_actor(actor);
 select * into w from public.work_requests where id=request_id for update;
 if w.client_id is distinct from actor then raise exception 'forbidden' using errcode='42501'; end if;
 if w.status<>'published' or not private.verified_talent(talent_id) then raise exception 'invitation_unavailable'; end if;
 insert into public.work_request_invites(work_request_id,profile_id) values(w.id,talent_id) on conflict do nothing;
 if found then insert into public.notifications(profile_id,category,title,body,data) values(talent_id,'projects','Private work invitation',w.title,jsonb_build_object('workRequestId',w.id)); end if;
 return '{"ok":true}';
end$$;
revoke all on function public.gw_invite(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.gw_invite(uuid,uuid,uuid) to service_role;
-- Staff-only/private avatars are not globally listable by every signed-in user.
drop policy "avatar authenticated read" on storage.objects;
create policy "active storage accounts" on storage.objects as restrictive for all to authenticated using(private.active_account()) with check(private.active_account());

-- Protect file references from cross-project substitution and fabricated metadata.
create function private.guard_project_file() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.storage_path not like new.project_id::text||'/'||new.uploader_id::text||'/%' then raise exception 'invalid_file_path'; end if;
 if new.delivery_id is not null and not exists(select 1 from public.project_deliveries where id=new.delivery_id and project_id=new.project_id) then raise exception 'invalid_delivery_reference'; end if;
 if not exists(select 1 from storage.objects where bucket_id='project-files' and name=new.storage_path and (metadata->>'size')::bigint=new.size_bytes and metadata->>'mimetype'=new.mime_type) then raise exception 'file_metadata_mismatch'; end if;
 return new;
end$$;
revoke all on function private.guard_project_file() from public,anon,authenticated;
create trigger valid_project_file before insert on public.project_files for each row execute function private.guard_project_file();

create function private.guard_portfolio_media() returns trigger language plpgsql security definer set search_path='' as $$
declare owner uuid; settings jsonb; used integer; max_count integer; max_bytes bigint; begin
 select profile_id into owner from public.portfolios where id=new.portfolio_id;
 perform pg_advisory_xact_lock(hashtextextended(owner::text||':portfolio',0));
 if new.storage_path not like owner::text||'/'||new.portfolio_id::text||'/%' or not exists(select 1 from storage.objects where bucket_id='portfolio' and name=new.storage_path and (metadata->>'size')::bigint=new.size_bytes and metadata->>'mimetype'=new.mime_type) then raise exception 'file_metadata_mismatch'; end if;
 if (new.media_type='image' and new.mime_type not in('image/jpeg','image/png','image/webp')) or (new.media_type='video' and new.mime_type not in('video/mp4','video/webm')) then raise exception 'invalid_media_type'; end if;
 select value into settings from public.settings where key='portfolio_limits';
 max_count:=coalesce((settings->>case new.media_type when 'image' then 'images' else 'videos' end)::integer,case new.media_type when 'image' then 6 else 3 end);
 max_bytes:=coalesce((settings->>case new.media_type when 'image' then 'image_bytes' else 'video_bytes' end)::bigint,case new.media_type when 'image' then 10485760 else 104857600 end);
 select count(*) into used from public.portfolio_media m join public.portfolios p on p.id=m.portfolio_id where p.profile_id=owner and m.media_type=new.media_type and m.id<>new.id;
 if used>=max_count or new.size_bytes>max_bytes then raise exception 'portfolio_limit_reached'; end if;
 return new;
end$$;
revoke all on function private.guard_portfolio_media() from public,anon,authenticated;
create trigger valid_portfolio_media before insert or update on public.portfolio_media for each row execute function private.guard_portfolio_media();

create function private.assert_balanced_ledger() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.ledger_entries where transaction_id=new.transaction_id group by transaction_id,currency having sum(case direction when 'debit' then amount_minor else -amount_minor end)<>0) then raise exception 'unbalanced_ledger'; end if;
 return null;
end$$;
revoke all on function private.assert_balanced_ledger() from public,anon,authenticated;
create constraint trigger balanced_journal after insert on public.ledger_entries deferrable initially deferred for each row execute function private.assert_balanced_ledger();
revoke update,delete on public.ledger_entries from service_role,authenticated,anon;

create function public.gw_create_role(actor uuid, name text, description text, permissions text[]) returns jsonb language plpgsql set search_path='' as $$
declare role_id uuid; begin
 perform private.require_actor(actor,'*');
 if length(trim(name)) not between 2 and 80 then raise exception 'invalid_role'; end if;
 insert into public.roles(name,description,system) values(name,description,false) returning id into role_id;
 insert into public.role_permissions(role_id,permission_key) select role_id,unnest(permissions) on conflict do nothing;
 return jsonb_build_object('id',role_id);
end$$;
create function public.gw_assign_role(actor uuid, target uuid, role_id uuid, action text) returns jsonb language plpgsql set search_path='' as $$
begin
 perform private.require_actor(actor,'*');
 if action='assign' then insert into public.admin_roles(profile_id,role_id,assigned_by) values(target,role_id,actor) on conflict do nothing;
 elsif action='unassign' then
  if target=actor then raise exception 'cannot_remove_own_role'; end if;
  delete from public.admin_roles where profile_id=target and admin_roles.role_id=gw_assign_role.role_id;
 else raise exception 'invalid_action'; end if;
 return '{"ok":true}';
end$$;
revoke all on function public.gw_create_role(uuid,text,text,text[]),public.gw_assign_role(uuid,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.gw_create_role(uuid,text,text,text[]),public.gw_assign_role(uuid,uuid,uuid,text) to service_role;

-- Profile edits and draft confirmation are one transaction, including skill changes.
create function public.gw_save_profile(actor uuid,display_name text default null,details jsonb default '{}',skill_ids uuid[] default null,draft_id uuid default null) returns jsonb language plpgsql set search_path='' as $$
declare p public.profiles; i public.individual_profiles; t public.team_profiles; c public.client_profiles; d public.profile_drafts; ready boolean; begin
 perform private.require_actor(actor);
 select * into p from public.profiles where id=actor for update;
 if display_name is not null and length(trim(display_name)) not between 2 and 100 then raise exception 'invalid_name'; end if;
 if draft_id is not null then
  select * into d from public.profile_drafts where id=draft_id and profile_id=actor for update;
  if d.id is null or d.confirmed_at is not null or d.source_kind<>p.account_type::text then raise exception 'invalid_draft'; end if;
  if d.source_path is not null and (d.source_path not like actor::text||'/%' or not exists(select 1 from storage.objects where bucket_id='documents' and name=d.source_path)) then raise exception 'invalid_draft_document'; end if;
 end if;
 if p.account_type='individual' then
  if details-array['legal_name','professional_title','bio','gaza_location','phone_private','email_private','availability','years_experience','hourly_rate_minor','currency','languages','tools','education','experience','date_of_birth_private','preferred_fields','linkedin_url','website_url']::text[] <> '{}'::jsonb then raise exception 'invalid_profile_fields'; end if;
  select * into i from public.individual_profiles where profile_id=actor for update;
  i:=jsonb_populate_record(i,details);
  update public.individual_profiles set legal_name=i.legal_name,professional_title=i.professional_title,bio=i.bio,gaza_location=i.gaza_location,phone_private=i.phone_private,email_private=i.email_private,availability=i.availability,years_experience=i.years_experience,hourly_rate_minor=i.hourly_rate_minor,currency=i.currency,languages=i.languages,tools=i.tools,education=i.education,experience=i.experience,date_of_birth_private=i.date_of_birth_private,preferred_fields=i.preferred_fields,linkedin_url=i.linkedin_url,website_url=i.website_url where profile_id=actor;
  ready:=length(trim(coalesce(i.professional_title,'')))>0 and length(trim(coalesce(i.bio,'')))>0 and length(trim(coalesce(i.gaza_location,'')))>0 and length(trim(coalesce(i.availability,'')))>0;
 elsif p.account_type='team' then
  if details-array['description','gaza_location','team_size','representative_private','contact_private','rate_minor','currency','services','expertise','achievements','history','linkedin_url','website_url']::text[] <> '{}'::jsonb then raise exception 'invalid_profile_fields'; end if;
  select * into t from public.team_profiles where profile_id=actor for update;
  t:=jsonb_populate_record(t,details);
  update public.team_profiles set description=t.description,gaza_location=t.gaza_location,team_size=t.team_size,representative_private=t.representative_private,contact_private=t.contact_private,rate_minor=t.rate_minor,currency=t.currency,services=t.services,expertise=t.expertise,achievements=t.achievements,history=t.history,linkedin_url=t.linkedin_url,website_url=t.website_url,team_name=coalesce(display_name,p.display_name) where profile_id=actor;
  ready:=length(trim(coalesce(t.description,'')))>0 and length(trim(coalesce(t.gaza_location,'')))>0 and t.team_size>0;
 elsif p.account_type='client' then
  if details-array['country_code','company_name','organization_type','phone_private']::text[] <> '{}'::jsonb then raise exception 'invalid_profile_fields'; end if;
  select * into c from public.client_profiles where profile_id=actor for update;
  c:=jsonb_populate_record(c,details);
  update public.client_profiles set country_code=c.country_code,company_name=c.company_name,organization_type=c.organization_type,phone_private=c.phone_private,full_name=coalesce(display_name,p.display_name) where profile_id=actor;
  ready:=c.country_code is not null and c.country_code<>'ZZ';
 end if;
 if skill_ids is not null then
  if p.account_type='client' or cardinality(skill_ids)>80 then raise exception 'invalid_skills'; end if;
  delete from public.profile_skills where profile_id=actor;
  insert into public.profile_skills(profile_id,skill_id,level) select actor,unnest(skill_ids),3 on conflict do nothing;
 end if;
 update public.profiles set display_name=coalesce(gw_save_profile.display_name,p.display_name),onboarding_complete=coalesce(ready,false),updated_at=now() where id=actor;
 if draft_id is not null then
  update public.profile_drafts set confirmed_at=now() where id=draft_id;
  if d.source_path is not null then
   if p.account_type='individual' then update public.individual_profiles set cv_path=d.source_path where profile_id=actor;
   elsif p.account_type='team' then update public.team_profiles set document_path=d.source_path where profile_id=actor; end if;
  end if;
 end if;
 return jsonb_build_object('ok',true,'onboardingComplete',coalesce(ready,false));
end$$;
revoke all on function public.gw_save_profile(uuid,text,jsonb,uuid[],uuid) from public,anon,authenticated;
grant execute on function public.gw_save_profile(uuid,text,jsonb,uuid[],uuid) to service_role;

create function public.gw_admin_user(actor uuid,target uuid,display_name text default null,status text default null,featured boolean default null) returns jsonb language plpgsql set search_path='' as $$
declare p public.profiles; begin
 perform private.require_actor(actor,'users.edit');
 if status is not null then
  perform private.require_actor(actor,'users.ban');
  if status not in('active','suspended','banned','deletion_pending') then raise exception 'invalid_status'; end if;
  if target=actor and status<>'active' then raise exception 'cannot_disable_own_account'; end if;
 end if;
 select * into p from public.profiles where id=target for update;
 if p.id is null then raise exception 'not_found'; end if;
 if display_name is not null and length(trim(display_name)) not between 2 and 100 then raise exception 'invalid_name'; end if;
 update public.profiles set display_name=coalesce(gw_admin_user.display_name,p.display_name),account_status=coalesce(gw_admin_user.status::public.account_status,p.account_status),updated_at=now() where id=target;
 if featured is not null then
  if p.account_type='individual' then update public.individual_profiles set featured=gw_admin_user.featured where profile_id=target;
  elsif p.account_type='team' then update public.team_profiles set featured=gw_admin_user.featured where profile_id=target;
  else raise exception 'talent_required'; end if;
 end if;
 return '{"ok":true}';
end$$;
revoke all on function public.gw_admin_user(uuid,uuid,text,text,boolean) from public,anon,authenticated;
grant execute on function public.gw_admin_user(uuid,uuid,text,text,boolean) to service_role;

create function public.gw_ai_quota(actor uuid) returns void language plpgsql set search_path='' as $$
begin
 perform private.require_actor(actor);
 perform private.consume_rate('ai:'||actor,10,60);
 perform private.consume_rate('ai_daily:'||actor,100,86400);
end$$;
revoke all on function public.gw_ai_quota(uuid) from public,anon,authenticated;
grant execute on function public.gw_ai_quota(uuid) to service_role;

-- Aggregate inside Postgres, never add money in different currencies together.
create function public.gw_analytics(actor uuid,from_date timestamptz default null,to_date timestamptz default null) returns jsonb language plpgsql set search_path='' as $$
declare finances jsonb:=null; result jsonb; begin
 perform private.require_actor(actor,'users.read');
 if to_date is not null and from_date is not null and to_date<=from_date then raise exception 'invalid_date_range'; end if;
 select jsonb_build_object(
  'totalUsers',(select count(*) from public.profiles where (from_date is null or created_at>=from_date) and (to_date is null or created_at<to_date)),
  'verifiedIndividuals',(select count(*) from public.individual_profiles i join public.profiles p on p.id=i.profile_id where i.verification_status='verified' and p.account_status='active'),
  'verifiedTeams',(select count(*) from public.team_profiles t join public.profiles p on p.id=t.profile_id where t.verification_status='verified' and p.account_status='active'),
  'clients',(select count(*) from public.profiles where account_type='client' and (from_date is null or created_at>=from_date) and (to_date is null or created_at<to_date)),
  'activeProjects',(select count(*) from public.projects where status not in('completed','payout_pending','paid','refunded','cancelled') and (from_date is null or created_at>=from_date) and (to_date is null or created_at<to_date)),
  'completedProjects',(select count(*) from public.projects where status in('completed','payout_pending','paid') and (from_date is null or created_at>=from_date) and (to_date is null or created_at<to_date)),
  'disputes',(select count(*) from public.disputes where status in('open','decided') and (from_date is null or created_at>=from_date) and (to_date is null or created_at<to_date)),
  'clientCountries',coalesce((select jsonb_agg(row_to_json(g)) from (select c.country_code,count(*) as count from public.client_profiles c join public.profiles p on p.id=c.profile_id where (from_date is null or p.created_at>=from_date) and (to_date is null or p.created_at<to_date) group by c.country_code order by count(*) desc limit 20)g),'[]'::jsonb),
  'topSkills',coalesce((select jsonb_agg(row_to_json(g)) from (select s.slug,count(*) as count from public.profile_skills ps join public.skills s on s.id=ps.skill_id group by s.slug order by count(*) desc limit 10)g),'[]'::jsonb),
  'topCategories',coalesce((select jsonb_agg(row_to_json(g)) from (select c.slug,count(*) as count from public.work_requests w join public.categories c on c.id=w.category_id where (from_date is null or w.created_at>=from_date) and (to_date is null or w.created_at<to_date) group by c.slug order by count(*) desc limit 10)g),'[]'::jsonb)
 ) into result;
 if public.has_permission('payments.read') then
  select coalesce(jsonb_agg(row_to_json(g)),'[]'::jsonb) into finances from (
   select t.currency,sum(t.gross_minor) as gross_minor,
    sum(coalesce(t.settlement_deduction_minor,t.platform_deduction_minor)-t.provider_fee_minor) as platform_revenue_minor,
    sum(coalesce(t.settlement_worker_due_minor,t.worker_entitlement_minor)-coalesce((select sum(po.amount_minor) from public.payouts po where po.transaction_id=t.id and po.status='paid'),0)) as payout_obligation_minor,
    sum(t.refund_due_minor) as refund_obligation_minor
   from public.transactions t where (from_date is null or t.created_at>=from_date) and (to_date is null or t.created_at<to_date)
   group by t.currency order by t.currency
  )g;
 end if;
 return result||jsonb_build_object('finances',finances,'from',from_date,'to',to_date);
end$$;
revoke all on function public.gw_analytics(uuid,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.gw_analytics(uuid,timestamptz,timestamptz) to service_role;
