-- Realtime and operational audit support.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='chat_messages') then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end$$;

create or replace function public.audit_row_change() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into public.audit_logs(actor_id,action,entity_type,entity_id,old_data,new_data)
  values(
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    coalesce((case when TG_OP='DELETE' then to_jsonb(old)->>'id' else to_jsonb(new)->>'id' end),''),
    case when TG_OP in('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when TG_OP in('INSERT','UPDATE') then to_jsonb(new) else null end
  );
  return case when TG_OP='DELETE' then old else new end;
end$$;

revoke execute on function public.audit_row_change() from public,anon,authenticated;

do $$
declare t text;
begin
  foreach t in array array['verification_requests','appointments','projects','transactions','payouts','disputes','appeals','message_moderation','admin_roles','roles','role_permissions','settings','site_pages','articles']
  loop
    execute format('drop trigger if exists %I on public.%I','audit_'||t,t);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.audit_row_change()','audit_'||t,t);
  end loop;
end$$;
