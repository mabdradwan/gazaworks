-- Safe fictional taxonomy and RBAC seed. Auth-linked personas are created by scripts/seed-users.mjs after local Auth starts.
insert into permissions(key,description) values ('*','All permissions'),('users.read','Read users'),('users.edit','Edit users'),('users.ban','Suspend and ban users'),('verification.approve','Decide verification'),('appointments.manage','Manage interview slots'),('payments.read','Read financial records'),('payouts.approve','Approve payouts'),('disputes.manage','Decide disputes'),('messages.review','Review held messages'),('content.edit','Manage CMS'),('projects.read','Inspect projects'),('offers.read','Inspect offers') on conflict do nothing;
insert into roles(name,description,system) values ('Super Admin','Complete administration',true),('Verification Officer','Verification and interviews',true),('Finance','Payments and payouts',true),('Support','User support',true),('Moderator','Message and review moderation',true),('Content Editor','CMS publishing',true),('Dispute Manager','Dispute and appeal decisions',true) on conflict do nothing;
insert into role_permissions select r.id,p.key from roles r cross join permissions p where r.name='Super Admin' and p.key='*' on conflict do nothing;
insert into categories(slug) values ('design'),('software-development'),('writing-translation'),('video-animation'),('business-services') on conflict do nothing;
insert into skills(slug) values ('product-design'),('typescript'),('react'),('video-editing'),('motion-design'),('translation'),('project-management') on conflict do nothing;


-- Seed after migrations, when roles and taxonomy actually exist.
insert into permissions(key,description) values ('reviews.moderate','Moderate abusive reviews') on conflict do nothing;
insert into role_permissions(role_id,permission_key)
select r.id,v.permission from roles r join (values
 ('Verification Officer','users.read'),('Verification Officer','verification.approve'),('Verification Officer','appointments.manage'),('Verification Officer','notifications.manage'),
 ('Finance','users.read'),('Finance','payments.read'),('Finance','payouts.approve'),
 ('Support','users.read'),('Support','notifications.manage'),
 ('Moderator','users.read'),('Moderator','messages.review'),('Moderator','reviews.moderate'),('Moderator','notifications.manage'),
 ('Content Editor','content.edit'),('Content Editor','taxonomy.manage'),('Content Editor','email.manage'),
 ('Dispute Manager','users.read'),('Dispute Manager','projects.read'),('Dispute Manager','disputes.manage'),('Dispute Manager','offers.read')
) v(role,permission) on v.role=r.name on conflict do nothing;

insert into category_translations(category_id,locale,name)
select c.id,l.locale,v.names[l.i] from categories c join (values
 ('design',array['التصميم','Design','Tasarım','Diseño','Design','Design']),
 ('software-development',array['تطوير البرمجيات','Software Development','Yazılım Geliştirme','Desarrollo de software','Développement logiciel','Softwareentwicklung']),
 ('writing-translation',array['الكتابة والترجمة','Writing & Translation','Yazı ve Çeviri','Redacción y traducción','Rédaction et traduction','Text und Übersetzung']),
 ('video-animation',array['الفيديو والرسوم المتحركة','Video & Animation','Video ve Animasyon','Vídeo y animación','Vidéo et animation','Video und Animation']),
 ('business-services',array['خدمات الأعمال','Business Services','İş Hizmetleri','Servicios empresariales','Services aux entreprises','Unternehmensdienstleistungen'])
) v(slug,names) on v.slug=c.slug cross join unnest(array['ar','en','tr','es','fr','de']) with ordinality l(locale,i) on conflict do nothing;

insert into skill_translations(skill_id,locale,name)
select s.id,l.locale,v.names[l.i] from skills s join (values
 ('product-design',array['تصميم المنتجات','Product Design','Ürün Tasarımı','Diseño de productos','Conception de produits','Produktdesign']),
 ('typescript',array['TypeScript','TypeScript','TypeScript','TypeScript','TypeScript','TypeScript']),
 ('react',array['React','React','React','React','React','React']),
 ('video-editing',array['مونتاج الفيديو','Video Editing','Video Düzenleme','Edición de vídeo','Montage vidéo','Videoschnitt']),
 ('motion-design',array['التصميم الحركي','Motion Design','Hareketli Tasarım','Diseño de animación','Design d’animation','Motion Design']),
 ('translation',array['الترجمة','Translation','Çeviri','Traducción','Traduction','Übersetzung']),
 ('project-management',array['إدارة المشاريع','Project Management','Proje Yönetimi','Gestión de proyectos','Gestion de projets','Projektmanagement'])
) v(slug,names) on v.slug=s.slug cross join unnest(array['ar','en','tr','es','fr','de']) with ordinality l(locale,i) on conflict do nothing;
