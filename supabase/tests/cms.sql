\set ON_ERROR_STOP on
begin;
create temporary table cms_ids(name text primary key,id uuid);
grant all on cms_ids to service_role,authenticated;
create function pg_temp.id(text) returns uuid language sql as $$select id from cms_ids where name=$1$$;
create function pg_temp.ok(condition boolean,label text) returns void language plpgsql as $$begin if condition is not true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end$$;
create function pg_temp.denied(statement text,expected text,label text) returns void language plpgsql as $$declare message text;begin begin execute statement;exception when others then message:=sqlerrm;end;if message is null or message not like '%'||expected||'%' then raise exception 'FAIL: %, got: %',label,coalesce(message,'no error'); end if;raise notice 'PASS: %',label;end$$;
create function pg_temp.fail_translation() returns trigger language plpgsql as $$begin if new.title='Throw' then raise exception 'translation_failure'; end if; return new; end$$;
create trigger test_article_translation_failure before insert or update on public.article_translations for each row execute function pg_temp.fail_translation();
create trigger test_page_translation_failure before insert or update on public.site_translations for each row execute function pg_temp.fail_translation();
insert into cms_ids values ('editor','91111111-1111-4111-8111-111111111111'),('reader','92222222-2222-4222-8222-222222222222');
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data)
select id,name||'@cms.test',now(),jsonb_build_object('account_type','client','display_name','CMS '||name) from cms_ids;
insert into public.admin_roles(profile_id,role_id) select pg_temp.id('editor'),id from public.roles where name='Content Editor';

set local role service_role;
select pg_temp.denied($q$select public.gw_save_article(pg_temp.id('reader'),'reader-article','en','Title',null,'Body','published')$q$,'forbidden','non-editor cannot publish');
select pg_temp.denied($q$select public.gw_save_site_page(pg_temp.id('reader'),'reader-page','en','Title','Body','published')$q$,'forbidden','non-editor cannot publish a page');
select pg_temp.denied($q$select public.gw_save_article(pg_temp.id('editor'),'rolled-back-article','en','Throw',null,'Body','published')$q$,'translation_failure','article translation failure aborts publication');
select pg_temp.ok(not exists(select 1 from public.articles where slug='rolled-back-article'),'failed translation leaves no article');
select pg_temp.denied($q$select public.gw_save_site_page(pg_temp.id('editor'),'rolled-back-page','en','Throw','Body','published')$q$,'translation_failure','page translation failure aborts publication');
select pg_temp.ok(not exists(select 1 from public.site_pages where slug='rolled-back-page'),'failed translation leaves no page');

select public.gw_save_article(pg_temp.id('editor'),'atomic-article','ar','مقال',null,'النص','published');
select pg_temp.ok((select a.status='published' and a.published_at is not null and t.body='النص' from public.articles a join public.article_translations t on t.article_id=a.id and t.locale='ar' where a.slug='atomic-article'),'article and translation publish together');
select public.gw_save_article(pg_temp.id('editor'),'atomic-article','en','Story',null,'English body','draft');
select pg_temp.ok((select a.status='draft' and a.published_at is null and count(t.*)=2 from public.articles a join public.article_translations t on t.article_id=a.id where a.slug='atomic-article' group by a.id),'unpublish preserves translations and clears public date');
select public.gw_save_site_page(pg_temp.id('editor'),'atomic-page','fr','Page','Contenu','published');
select pg_temp.ok((select p.status='published' and t.content->>'body'='Contenu' from public.site_pages p join public.site_translations t on t.page_id=p.id and t.locale='fr' where p.slug='atomic-page'),'page and translation publish together');
select pg_temp.ok((select count(*)=3 from public.audit_logs where actor_id=pg_temp.id('editor') and action in('content.article.save','content.page.save')),'CMS writes are audited');

set local role authenticated;
select set_config('request.jwt.claim.sub',pg_temp.id('editor')::text,true);
select pg_temp.denied($q$select public.gw_save_article(auth.uid(),'bypass','en','Title',null,'Body','published')$q$,'permission denied','editor browser cannot bypass server RPC');
select pg_temp.denied($q$insert into public.articles(slug,status) values('bypass','published')$q$,'permission denied','browser cannot publish directly');
select pg_temp.denied($q$update public.site_pages set status='published' where slug='atomic-page'$q$,'permission denied','browser cannot modify publication status directly');
rollback;
