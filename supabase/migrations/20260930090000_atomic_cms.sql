-- Publishing and translation updates must commit together. Browser roles cannot
-- write the CMS tables directly; these actor-bound RPCs are server-only.
revoke insert, update, delete on public.articles, public.article_translations,
  public.site_pages, public.site_translations from public, anon, authenticated;

create function public.gw_save_article(
  actor uuid, slug text, language text, title text, excerpt text, body text,
  publication_status text
) returns jsonb language plpgsql set search_path='' as $$
declare article_id uuid;
begin
  perform private.require_actor(actor, 'content.edit');
  if slug is null or slug !~ '^[a-z0-9-]{1,100}$'
    or language is null or language not in ('ar','en','tr','es','fr','de')
    or title is null or length(title) not between 2 and 250
    or excerpt is not null and length(excerpt)>1000
    or body is null or length(body) not between 1 and 200000
    or publication_status is null or publication_status not in ('draft','published')
  then raise exception 'invalid_article'; end if;

  insert into public.articles(slug,status,author_id,published_at)
  values(slug,'draft',actor,null)
  on conflict on constraint articles_slug_key do update set slug=excluded.slug
  returning id into article_id;

  insert into public.article_translations(article_id,locale,title,excerpt,body)
  values(article_id,language,title,excerpt,body)
  on conflict on constraint article_translations_pkey do update set
    title=excluded.title, excerpt=excluded.excerpt, body=excluded.body;

  update public.articles set status=publication_status,
    published_at=case when publication_status='published' then coalesce(published_at,now()) else null end
  where id=article_id;

  insert into public.audit_logs(actor_id,action,entity_type,entity_id,new_data)
  values(actor,'content.article.save','articles',article_id::text,
    jsonb_build_object('locale',language,'status',publication_status));
  return jsonb_build_object('id',article_id,'ok',true);
end$$;

create function public.gw_save_site_page(
  actor uuid, slug text, language text, title text, body text,
  publication_status text
) returns jsonb language plpgsql set search_path='' as $$
declare page_id uuid;
begin
  perform private.require_actor(actor, 'content.edit');
  if slug is null or slug !~ '^[a-z0-9-]{1,100}$'
    or language is null or language not in ('ar','en','tr','es','fr','de')
    or title is null or length(title) not between 2 and 200
    or body is null or length(body)>100000
    or publication_status is null or publication_status not in ('draft','published')
  then raise exception 'invalid_site_page'; end if;

  insert into public.site_pages(slug,status,updated_at)
  values(slug,'draft',now())
  on conflict on constraint site_pages_slug_key do update set slug=excluded.slug
  returning id into page_id;

  insert into public.site_translations(page_id,locale,title,content)
  values(page_id,language,title,jsonb_build_object('body',body))
  on conflict on constraint site_translations_pkey do update set
    title=excluded.title,content=excluded.content;

  update public.site_pages set status=publication_status,updated_at=now()
  where id=page_id;

  insert into public.audit_logs(actor_id,action,entity_type,entity_id,new_data)
  values(actor,'content.page.save','site_pages',page_id::text,
    jsonb_build_object('locale',language,'status',publication_status));
  return jsonb_build_object('id',page_id,'ok',true);
end$$;

revoke all on function public.gw_save_article(uuid,text,text,text,text,text,text),
  public.gw_save_site_page(uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.gw_save_article(uuid,text,text,text,text,text,text),
  public.gw_save_site_page(uuid,text,text,text,text,text) to service_role;
