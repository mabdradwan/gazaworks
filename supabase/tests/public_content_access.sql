-- Read-only production-safe regression assertions. Any violation raises an error.
begin read only;
set local role anon;
do $$
begin
  if has_function_privilege(current_user, 'public.has_permission(text)', 'EXECUTE') then
    raise exception 'Anonymous RBAC execution must remain revoked';
  end if;
  perform id from public.site_pages where status = 'published';
  perform page_id from public.site_translations;
  perform id from public.articles where status = 'published';
  perform article_id from public.article_translations;
  perform id from public.categories where active;
  perform category_id from public.category_translations;
  perform id from public.skills where active;
  perform skill_id from public.skill_translations;
  perform key from public.settings where public;
  if exists(select 1 from public.site_pages where status <> 'published')
    or exists(select 1 from public.articles where status <> 'published')
    or exists(select 1 from public.categories where not active)
    or exists(select 1 from public.skills where not active)
    or exists(select 1 from public.settings where not public) then
    raise exception 'Nonpublic content leaked to anonymous readers';
  end if;
end $$;
set local role authenticated;
do $$ begin
  perform id from public.site_pages where status = 'published';
  perform id from public.categories where active;
end $$;
rollback;
