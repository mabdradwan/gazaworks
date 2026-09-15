-- Tighten callable functions and add operational defaults.
revoke execute on function public.has_permission(text) from public, anon;
grant execute on function public.has_permission(text) to authenticated;

-- Public taxonomy translations for supported locales.
insert into public.category_translations(category_id,locale,name)
select id,'en',case slug
 when 'design' then 'Design'
 when 'software-development' then 'Software Development'
 when 'writing-translation' then 'Writing & Translation'
 when 'video-animation' then 'Video & Animation'
 when 'business-services' then 'Business Services' end
from public.categories on conflict do nothing;

insert into public.category_translations(category_id,locale,name)
select id,'ar',case slug
 when 'design' then 'التصميم'
 when 'software-development' then 'تطوير البرمجيات'
 when 'writing-translation' then 'الكتابة والترجمة'
 when 'video-animation' then 'الفيديو والرسوم المتحركة'
 when 'business-services' then 'خدمات الأعمال' end
from public.categories on conflict do nothing;

insert into public.skill_translations(skill_id,locale,name)
select id,'en',case slug
 when 'product-design' then 'Product Design'
 when 'typescript' then 'TypeScript'
 when 'react' then 'React'
 when 'video-editing' then 'Video Editing'
 when 'motion-design' then 'Motion Design'
 when 'translation' then 'Translation'
 when 'project-management' then 'Project Management' end
from public.skills on conflict do nothing;

insert into public.skill_translations(skill_id,locale,name)
select id,'ar',case slug
 when 'product-design' then 'تصميم المنتجات'
 when 'typescript' then 'TypeScript'
 when 'react' then 'React'
 when 'video-editing' then 'مونتاج الفيديو'
 when 'motion-design' then 'الموشن ديزاين'
 when 'translation' then 'الترجمة'
 when 'project-management' then 'إدارة المشاريع' end
from public.skills on conflict do nothing;

-- Initial editable CMS pages. Content can be replaced from the future admin CMS.
insert into public.site_pages(slug,status) values
('about','published'),('how-it-works','published'),('faq','published'),('privacy','published'),
('terms','published'),('payment-policy','published'),('dispute-policy','published'),
('verification-policy','published'),('community-guidelines','published')
on conflict(slug) do nothing;

insert into public.site_translations(page_id,locale,title,content)
select id,'en',initcap(replace(slug,'-',' ')),jsonb_build_object('body','GazaWorks content is managed by the administration team.')
from public.site_pages on conflict do nothing;

insert into public.site_translations(page_id,locale,title,content)
select id,'ar',
case slug
 when 'about' then 'عن غزة ووركس'
 when 'how-it-works' then 'كيف تعمل المنصة'
 when 'faq' then 'الأسئلة الشائعة'
 when 'privacy' then 'سياسة الخصوصية'
 when 'terms' then 'شروط الاستخدام'
 when 'payment-policy' then 'سياسة الدفع'
 when 'dispute-policy' then 'سياسة النزاعات'
 when 'verification-policy' then 'سياسة التحقق'
 when 'community-guidelines' then 'إرشادات المجتمع'
 else slug end,
jsonb_build_object('body','يمكن لإدارة غزة ووركس تحديث هذا المحتوى من نظام إدارة المحتوى.')
from public.site_pages on conflict do nothing;
