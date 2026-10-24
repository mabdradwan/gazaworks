-- Anonymous published content must not execute the authenticated-only RBAC helper.
-- Preserve all signed-in conditions; anonymous readers receive only existing public content.
alter policy "public pages" on public.site_pages to authenticated;
create policy "anon published pages" on public.site_pages for select to anon using (status = 'published');

alter policy "public page translations" on public.site_translations to authenticated;
create policy "anon published page translations" on public.site_translations for select to anon using (exists (select 1 from public.site_pages p where p.id = site_translations.page_id and p.status = 'published'));

alter policy "public published articles" on public.articles to authenticated;
create policy "anon published articles" on public.articles for select to anon using (status = 'published');

alter policy "public article translations" on public.article_translations to authenticated;
create policy "anon published article translations" on public.article_translations for select to anon using (exists (select 1 from public.articles a where a.id = article_translations.article_id and a.status = 'published'));

alter policy "taxonomy categories read" on public.categories to authenticated;
create policy "anon active categories" on public.categories for select to anon using (active = true);

alter policy "taxonomy category translations read" on public.category_translations to authenticated;
create policy "anon active category translations" on public.category_translations for select to anon using (exists (select 1 from public.categories c where c.id = category_translations.category_id and c.active = true));

alter policy "taxonomy skills read" on public.skills to authenticated;
create policy "anon active skills" on public.skills for select to anon using (active = true);

alter policy "taxonomy skill translations read" on public.skill_translations to authenticated;
create policy "anon active skill translations" on public.skill_translations for select to anon using (exists (select 1 from public.skills s where s.id = skill_translations.skill_id and s.active = true));

alter policy "settings public read" on public.settings to authenticated;
create policy "anon public settings" on public.settings for select to anon using (public = true);

