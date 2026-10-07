export const adminGroups=[
 {key:'overview',modules:['Overview']},
 {key:'accounts',modules:['Users','Individuals','Teams','Clients']},
 {key:'trust',modules:['Verification']},
 {key:'work',modules:['Work Requests','Offers','Projects','Messages','Message Moderation','Reviews','Notifications']},
 {key:'finance',modules:['Transactions','Payments','Payouts','Disputes','Appeals']},
 {key:'content',modules:['Blog','Static Pages','Media','Categories','Skills','Languages','Email Templates']},
 {key:'settings',modules:['AI Settings','Payment Settings','System Settings','Security Logs','Audit Logs','Roles']}
] as const;
const copy={
 ar:['نظرة عامة','الحسابات والمشتركون','التوثيق والمواعيد','العمل والتواصل','الماليات والنزاعات','المحتوى والتصنيفات','الإعدادات والصلاحيات','ابحث باسم المشترك','اكتب الاسم أو جزءًا منه…','مسح البحث','النتائج','جميع المشتركين'],
 en:['Overview','Accounts and members','Verification and appointments','Work and communication','Finance and disputes','Content and categories','Settings and permissions','Search by member name','Enter a name or part of it…','Clear search','Results','All members'],
 tr:['Genel bakış','Hesaplar ve üyeler','Doğrulama ve randevular','İş ve iletişim','Finans ve uyuşmazlıklar','İçerik ve kategoriler','Ayarlar ve yetkiler','Üye adına göre ara','Ad veya adın bir kısmını yazın…','Aramayı temizle','Sonuçlar','Tüm üyeler'],
 es:['Resumen','Cuentas y miembros','Verificación y citas','Trabajo y comunicación','Finanzas y disputas','Contenido y categorías','Ajustes y permisos','Buscar por nombre','Escribe un nombre o parte de él…','Borrar búsqueda','Resultados','Todos los miembros'],
 fr:['Vue d’ensemble','Comptes et membres','Vérification et rendez-vous','Travail et communication','Finances et litiges','Contenu et catégories','Paramètres et droits','Rechercher par nom','Saisissez un nom ou une partie…','Effacer la recherche','Résultats','Tous les membres'],
 de:['Übersicht','Konten und Mitglieder','Verifizierung und Termine','Arbeit und Kommunikation','Finanzen und Streitfälle','Inhalte und Kategorien','Einstellungen und Rechte','Nach Mitgliedsnamen suchen','Name oder Teil des Namens…','Suche löschen','Ergebnisse','Alle Mitglieder']
} as const;
export function adminNavigationCopy(locale:string){const c=copy[locale as keyof typeof copy]??copy.en;return {groups:Object.fromEntries(adminGroups.map((g,i)=>[g.key,c[i]])),search:c[7],placeholder:c[8],clear:c[9],results:c[10],all:c[11]};}
export const accountModules=['Users','Individuals','Teams','Clients'] as const;
export function adminAccountType(module:string){return module==='Individuals'?'individual':module==='Teams'?'team':module==='Clients'?'client':undefined;}
