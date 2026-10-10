do $$
begin
 if (select count(*) from public.categories where slug in ('ui-ux','video-editing','data-ai','engineering-architecture','education-training','consulting'))<>6 then raise exception 'professional category coverage missing'; end if;
 if exists(select 1 from public.categories c cross join unnest(array['ar','en','tr','es','fr','de']) l(locale) where c.slug in ('ui-ux','video-editing','data-ai','engineering-architecture','education-training','consulting') and not exists(select 1 from public.category_translations t where t.category_id=c.id and t.locale=l.locale and length(trim(t.name))>0)) then raise exception 'professional category locale missing'; end if;
 if not (select relrowsecurity from pg_class where oid='public.categories'::regclass) or not (select relrowsecurity from pg_class where oid='public.category_translations'::regclass) then raise exception 'taxonomy RLS missing'; end if;
end $$;
