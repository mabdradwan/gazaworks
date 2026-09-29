-- Development simulations must never be recorded as real worker transfers.
create index if not exists payments_real_captured_transaction_idx
  on public.payments(transaction_id,amount_minor)
  where status='captured' and simulated=false;

create function private.require_real_funding_for_payout() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.status in('approved','processing','paid') and not exists(
  select 1 from public.transactions t join public.payments payment on payment.transaction_id=t.id
  where t.id=new.transaction_id and t.provider<>'mock'
    and payment.status='captured' and payment.simulated=false and payment.amount_minor=t.gross_minor
 ) then
  raise exception 'real_funding_required_for_payout' using errcode='23514';
 end if;
 return new;
end$$;
revoke all on function private.require_real_funding_for_payout() from public,anon,authenticated;
grant execute on function private.require_real_funding_for_payout() to service_role;
create trigger payouts_require_real_funding
  before insert or update of status,transaction_id on public.payouts
  for each row execute function private.require_real_funding_for_payout();

-- Financial analytics represent actual confirmed funds, not simulator journal entries.
create or replace function public.gw_analytics(actor uuid,from_date timestamptz default null,to_date timestamptz default null) returns jsonb language plpgsql set search_path='' as $$
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
   from public.transactions t
   where t.provider<>'mock' and (from_date is null or t.created_at>=from_date) and (to_date is null or t.created_at<to_date)
     and exists(select 1 from public.payments payment where payment.transaction_id=t.id
       and payment.status='captured' and payment.simulated=false and payment.amount_minor=t.gross_minor)
   group by t.currency order by t.currency
  )g;
 end if;
 return result||jsonb_build_object('finances',finances,'from',from_date,'to',to_date);
end$$;
