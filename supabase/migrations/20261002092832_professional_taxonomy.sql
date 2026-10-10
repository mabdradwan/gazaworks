-- Additive catalogue only. Existing projects and category IDs remain unchanged.
with catalogue(slug,ar,en,tr,es,fr,de) as (values
 ('marketing-sales','التسويق والمبيعات','Marketing & Sales','Pazarlama ve Satış','Marketing y ventas','Marketing et ventes','Marketing und Vertrieb'),
 ('ui-ux','تصميم تجربة وواجهة المستخدم','UI/UX Design','UI/UX Tasarımı','Diseño UI/UX','Design UI/UX','UI/UX-Design'),
 ('brand-identity','الهوية البصرية','Brand Identity','Marka Kimliği','Identidad de marca','Identité visuelle','Markenidentität'),
 ('illustration','الرسم والتوضيح','Illustration','İllüstrasyon','Ilustración','Illustration','Illustration'),
 ('3d-design','التصميم ثلاثي الأبعاد','3D Design','3B Tasarım','Diseño 3D','Design 3D','3D-Design'),
 ('video-editing','مونتاج الفيديو','Video Editing','Video Düzenleme','Edición de vídeo','Montage vidéo','Videoschnitt'),
 ('motion-graphics','الموشن جرافيك','Motion Graphics','Hareketli Grafik','Gráficos en movimiento','Motion design','Motion Design'),
 ('photography','التصوير','Photography','Fotoğrafçılık','Fotografía','Photographie','Fotografie'),
 ('audio-voice','الصوت والتعليق الصوتي','Audio & Voice-over','Ses ve Seslendirme','Audio y locución','Audio et voix off','Audio und Sprecher'),
 ('social-media','إدارة التواصل الاجتماعي','Social Media','Sosyal Medya','Redes sociales','Réseaux sociaux','Soziale Medien'),
 ('seo','تحسين محركات البحث','SEO','SEO','SEO','SEO','SEO'),
 ('paid-advertising','الإعلانات المدفوعة','Paid Advertising','Ücretli Reklam','Publicidad de pago','Publicité payante','Bezahlte Werbung'),
 ('web-development','تطوير مواقع الويب','Web Development','Web Geliştirme','Desarrollo web','Développement web','Webentwicklung'),
 ('mobile-development','تطوير تطبيقات الموبايل','Mobile Development','Mobil Geliştirme','Desarrollo móvil','Développement mobile','Mobile Entwicklung'),
 ('data-ai','البيانات والذكاء الاصطناعي','Data & AI','Veri ve Yapay Zekâ','Datos e IA','Données et IA','Daten und KI'),
 ('qa-testing','اختبار وضمان الجودة','QA & Testing','Kalite ve Test','Pruebas y calidad','Tests et qualité','Qualität und Tests'),
 ('cybersecurity','الأمن السيبراني','Cybersecurity','Siber Güvenlik','Ciberseguridad','Cybersécurité','Cybersicherheit'),
 ('cloud-devops','الحوسبة السحابية والتشغيل','Cloud & DevOps','Bulut ve DevOps','Nube y DevOps','Cloud et DevOps','Cloud und DevOps'),
 ('content-copywriting','الكتابة وصناعة المحتوى','Content & Copywriting','İçerik ve Metin Yazarlığı','Contenido y redacción','Contenu et rédaction','Inhalte und Werbetexte'),
 ('translation','الترجمة','Translation','Çeviri','Traducción','Traduction','Übersetzung'),
 ('journalism','الصحافة والتحرير','Journalism & Editing','Gazetecilik ve Editörlük','Periodismo y edición','Journalisme et édition','Journalismus und Redaktion'),
 ('virtual-assistance','المساعدة الافتراضية','Virtual Assistance','Sanal Asistanlık','Asistencia virtual','Assistance virtuelle','Virtuelle Assistenz'),
 ('accounting-finance','المحاسبة والتمويل','Accounting & Finance','Muhasebe ve Finans','Contabilidad y finanzas','Comptabilité et finance','Buchhaltung und Finanzen'),
 ('project-management','إدارة المشاريع','Project Management','Proje Yönetimi','Gestión de proyectos','Gestion de projets','Projektmanagement'),
 ('customer-support','خدمة العملاء','Customer Support','Müşteri Desteği','Atención al cliente','Service client','Kundendienst'),
 ('engineering-architecture','الهندسة والعمارة','Engineering & Architecture','Mühendislik ve Mimarlık','Ingeniería y arquitectura','Ingénierie et architecture','Ingenieurwesen und Architektur'),
 ('interior-design','التصميم الداخلي','Interior Design','İç Mekân Tasarımı','Diseño de interiores','Design intérieur','Innenarchitektur'),
 ('education-training','التعليم والتدريب','Education & Training','Eğitim ve Öğretim','Educación y formación','Enseignement et formation','Bildung und Schulung'),
 ('consulting','الاستشارات','Consulting','Danışmanlık','Consultoría','Conseil','Beratung')),
 added as (insert into public.categories(slug) select slug from catalogue on conflict(slug) do update set active=true returning id,slug)
insert into public.category_translations(category_id,locale,name)
select a.id,v.locale,v.name from added a join catalogue c using(slug)
cross join lateral(values ('ar',c.ar),('en',c.en),('tr',c.tr),('es',c.es),('fr',c.fr),('de',c.de))v(locale,name)
on conflict(category_id,locale) do update set name=excluded.name;
