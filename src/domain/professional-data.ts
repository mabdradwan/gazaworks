export function westernDigits(value:string){return value.replace(/[٠-٩۰-۹]/g,c=>String(c.charCodeAt(0)-(c>='۰'?1776:1632))).normalize('NFC')}
export const localPhonePattern=/^05[0-9]{8}$/;
export const emailPattern=/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
export const languageNames=[['ar','العربية','Arabic'],['en','الإنجليزية','English'],['tr','التركية','Turkish'],['fr','الفرنسية','French'],['de','الألمانية','German'],['es','الإسبانية','Spanish'],['zh','الصينية','Chinese'],['hi','الهندية','Hindi'],['pt','البرتغالية','Portuguese'],['ru','الروسية','Russian']] as const;
export const proficiency=[['native','لغة أم','Native'],['excellent','ممتاز جداً','Excellent'],['very-good','جيد جداً','Very good'],['good','جيد','Good']] as const;
export const sectors=[['design','التصميم والإبداع','Design & creative'],['video','الفيديو والصوت','Video & audio'],['marketing','التسويق والمبيعات','Marketing & sales'],['development','البرمجة والتقنية','Development & technology'],['writing','الكتابة والترجمة','Writing & translation'],['business','الأعمال والإدارة','Business & administration'],['engineering','الهندسة والعمارة','Engineering & architecture'],['education','التعليم والاستشارات','Education & consulting']] as const;
type Role={id:string;ar:string;en:string;sector:string;aliases:string;tools:string[]};
const role=(id:string,ar:string,en:string,sector:string,tools:string[],aliases=''):Role=>({id,ar,en,sector,tools,aliases});
export const roles:Role[]=[
 role('ui-ux','مصمم تجربة وواجهة المستخدم','UI/UX Designer','design',['Figma','Adobe XD','Sketch','Miro'],'UX UI product design'),
 role('graphic','مصمم جرافيك','Graphic Designer','design',['Adobe Photoshop','Adobe Illustrator','Canva','Adobe InDesign']),
 role('brand','مصمم هوية بصرية','Brand Designer','design',['Adobe Illustrator','Adobe Photoshop','Figma']),
 role('illustration','رسام رقمي','Illustrator','design',['Procreate','Adobe Illustrator','Adobe Photoshop']),
 role('3d','مصمم ثلاثي الأبعاد','3D Artist','design',['Blender','Cinema 4D','Autodesk Maya']),
 role('video-editor','مونتير فيديو','Video Editor','video',['Adobe Premiere Pro','Adobe After Effects','CapCut','DaVinci Resolve'],'مونتاج editing'),
 role('motion','مصمم موشن جرافيك','Motion Designer','video',['Adobe After Effects','Cinema 4D','Blender']),
 role('photographer','مصور فوتوغرافي','Photographer','video',['Adobe Lightroom','Adobe Photoshop']),
 role('videographer','مصور وصانع أفلام','Videographer','video',['Adobe Premiere Pro','DaVinci Resolve','CapCut']),
 role('audio','مهندس صوت','Audio Engineer','video',['Adobe Audition','Audacity','FL Studio','Logic Pro']),
 role('voice','معلق صوتي','Voice-over Artist','video',['Adobe Audition','Audacity','ElevenLabs']),
 role('marketing','مسوق رقمي','Digital Marketer','marketing',['Google Analytics','Meta Ads Manager','Google Ads','Canva','HubSpot'],'digital marketing'),
 role('social','مدير منصات التواصل','Social Media Manager','marketing',['Meta Business Suite','Canva','Hootsuite','Buffer']),
 role('seo','مختص تحسين محركات البحث','SEO Specialist','marketing',['Google Search Console','Google Analytics','Semrush','Ahrefs']),
 role('ads','مختص إعلانات مدفوعة','Media Buyer','marketing',['Meta Ads Manager','Google Ads','TikTok Ads']),
 role('sales','مختص مبيعات','Sales Specialist','marketing',['HubSpot','Salesforce','Microsoft Excel']),
 role('frontend','مطور واجهات أمامية','Front-end Developer','development',['React','Next.js','TypeScript','Tailwind CSS','Git'],'FE frontend'),
 role('backend','مطور أنظمة خلفية','Back-end Developer','development',['Node.js','Python','PostgreSQL','Supabase','Git'],'BE backend'),
 role('fullstack','مطور تطبيقات متكامل','Full-stack Developer','development',['React','Next.js','Node.js','PostgreSQL','Git']),
 role('mobile','مطور تطبيقات موبايل','Mobile Developer','development',['Flutter','React Native','Android Studio','Swift']),
 role('wordpress','مطور ووردبريس','WordPress Developer','development',['WordPress','WooCommerce','PHP','Elementor']),
 role('qa','مختص اختبار وضمان الجودة','QA Tester','development',['Playwright','Cypress','Postman','Jira'],'QA quality assurance'),
 role('data','محلل بيانات','Data Analyst','development',['Microsoft Excel','Power BI','Tableau','Python','SQL']),
 role('ai','مهندس ذكاء اصطناعي','AI Engineer','development',['Python','PyTorch','TensorFlow','Jupyter','Git']),
 role('devops','مهندس تشغيل سحابي','DevOps Engineer','development',['Docker','Kubernetes','AWS','GitHub Actions','Terraform']),
 role('security','مختص أمن سيبراني','Cybersecurity Specialist','development',['Wireshark','Burp Suite','Kali Linux']),
 role('writer','كاتب محتوى','Content Writer','writing',['Google Docs','Microsoft Word','Notion']),
 role('copywriter','كاتب إعلانات','Copywriter','writing',['Google Docs','Notion','Grammarly']),
 role('translator','مترجم','Translator','writing',['Trados Studio','memoQ','Microsoft Word']),
 role('journalist','صحفي ومحرر','Journalist','writing',['Google Docs','Adobe InDesign','Microsoft Word']),
 role('virtual','مساعد افتراضي','Virtual Assistant','business',['Google Workspace','Microsoft Office','Trello','Notion']),
 role('project-manager','مدير مشاريع','Project Manager','business',['Jira','Asana','Trello','Microsoft Project']),
 role('accountant','محاسب','Accountant','business',['Microsoft Excel','QuickBooks','Xero']),
 role('hr','مختص موارد بشرية','HR Specialist','business',['Microsoft Excel','Google Workspace','BambooHR']),
 role('customer','مختص خدمة عملاء','Customer Support Specialist','business',['Zendesk','Intercom','HubSpot']),
 role('architect','مهندس معماري','Architect','engineering',['AutoCAD','Revit','SketchUp','Lumion']),
 role('civil','مهندس مدني','Civil Engineer','engineering',['AutoCAD','ETABS','SAP2000','Microsoft Excel']),
 role('interior','مصمم داخلي','Interior Designer','engineering',['SketchUp','AutoCAD','3ds Max','Lumion']),
 role('trainer','مدرب ومعلم','Trainer / Educator','education',['Google Classroom','Moodle','Canva','Microsoft PowerPoint']),
 role('consultant','مستشار أعمال','Business Consultant','education',['Microsoft Excel','Microsoft PowerPoint','Notion'])
];
export const allTools=[...new Set(roles.flatMap(r=>r.tools).concat(['ChatGPT','Gemini','Claude','Google Flow','CapCut','NotebookLM','Adobe Express','Figma','Adobe XD']))].sort();
export function findRole(value:string){const v=value.toLowerCase().trim();return roles.find(r=>[r.id,r.ar,r.en].some(x=>x.toLowerCase()===v))}
export function orderedTools(title:string){const preferred=findRole(title)?.tools??[];return [...preferred,...allTools.filter(t=>!preferred.includes(t))]}

export function normalizeProfessionalInput(value:unknown):unknown{if(typeof value==='string')return westernDigits(value);if(Array.isArray(value))return value.map(normalizeProfessionalInput);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,normalizeProfessionalInput(v)]));return value}
const translatedLanguages:Record<string,string[]>={tr:['Arapça','İngilizce','Türkçe','Fransızca','Almanca','İspanyolca','Çince','Hintçe','Portekizce','Rusça'],es:['Árabe','Inglés','Turco','Francés','Alemán','Español','Chino','Hindi','Portugués','Ruso'],fr:['Arabe','Anglais','Turc','Français','Allemand','Espagnol','Chinois','Hindi','Portugais','Russe'],de:['Arabisch','Englisch','Türkisch','Französisch','Deutsch','Spanisch','Chinesisch','Hindi','Portugiesisch','Russisch']};
const translatedLevels:Record<string,string[]>={tr:['Ana dil','Mükemmel','Çok iyi','İyi'],es:['Nativo','Excelente','Muy bueno','Bueno'],fr:['Langue maternelle','Excellent','Très bon','Bon'],de:['Muttersprache','Ausgezeichnet','Sehr gut','Gut']};
export function languageLabel(code:string,locale:string){const index=languageNames.findIndex(l=>l[0]===code);return index<0?code:translatedLanguages[locale]?.[index]??languageNames[index][locale==='ar'?1:2]}
export function proficiencyLabel(level:string,locale:string){const index=proficiency.findIndex(l=>l[0]===level);return index<0?level:translatedLevels[locale]?.[index]??proficiency[index][locale==='ar'?1:2]}
