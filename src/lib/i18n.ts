export const locales=["ar","en","tr","es","fr","de"] as const;
export type Locale=(typeof locales)[number];
export const isLocale=(value:string):value is Locale=>locales.includes(value as Locale);

type Copy={
 nav:{talent:string;work:string;trust:string;login:string;join:string};
 hero:{eyebrow:string;title:string;body:string;primary:string;secondary:string};
 stats:string[];
 sections:{services:string;talent:string;cta:string};
 footer:string;
};
const copy:Record<Locale,Copy>={
 en:{
  nav:{talent:"Find talent",work:"How it works",trust:"Trust",login:"Sign in",join:"Join GazaWorks"},
  hero:{eyebrow:"Verified professional marketplace",title:"Hire verified talent from Gaza",body:"Work with skilled professionals and teams through clear agreements, private collaboration, and recorded delivery.",primary:"Explore talent",secondary:"Post a work request"},
  stats:["Verified through in-person review","Private, accountable collaboration","Clear project agreements"],
  sections:{services:"Built for serious work",talent:"Specialists ready for global teams",cta:"Build exceptional work with Gaza"},
  footer:"Professional opportunity, built on trust."
 },
 ar:{
  nav:{talent:"اكتشف المواهب",work:"كيف نعمل",trust:"الثقة والتحقق",login:"تسجيل الدخول",join:"انضم إلى غزة ووركس"},
  hero:{eyebrow:"سوق مهني موثّق",title:"وظّف مواهب موثّقة من غزة",body:"تعاون مع محترفين وفرق ماهرة عبر اتفاقيات واضحة وتواصل خاص ومتابعة التسليم داخل المنصة.",primary:"استكشف المواهب",secondary:"انشر طلب عمل"},
  stats:["تحقق مهني ومقابلة حضورية","تعاون خاص ومسؤول","اتفاق واضح ومتابعة التسليم"],
  sections:{services:"مصمم للعمل الاحترافي",talent:"خبرات جاهزة للفرق العالمية",cta:"أنجز عملاً استثنائياً مع غزة"},
  footer:"فرص مهنية مبنية على الثقة."
 },
 tr:{
  nav:{talent:"Yetenek bul",work:"Nasıl çalışır",trust:"Güven",login:"Giriş yap",join:"GazaWorks'e katıl"},
  hero:{eyebrow:"Doğrulanmış profesyonel pazar",title:"Gazze'den doğrulanmış yeteneklerle çalışın",body:"Net anlaşmalar, özel iletişim ve kayıtlı teslim süreçleriyle profesyoneller ve ekiplerle çalışın.",primary:"Yetenekleri keşfet",secondary:"İş talebi yayınla"},
  stats:["Yüz yüze inceleme ile doğrulama","Özel ve hesap verebilir işbirliği","Açık proje anlaşmaları"],
  sections:{services:"Ciddi işler için tasarlandı",talent:"Küresel ekipler için uzmanlar",cta:"Gazze ile nitelikli işler üretin"},
  footer:"Güven üzerine kurulu profesyonel fırsatlar."
 },
 es:{
  nav:{talent:"Buscar talento",work:"Cómo funciona",trust:"Confianza",login:"Iniciar sesión",join:"Únete a GazaWorks"},
  hero:{eyebrow:"Mercado profesional verificado",title:"Contrata talento verificado de Gaza",body:"Trabaja con profesionales y equipos mediante acuerdos claros, comunicación privada y entregas registradas.",primary:"Explorar talento",secondary:"Publicar un proyecto"},
  stats:["Verificación mediante entrevista presencial","Colaboración privada y responsable","Acuerdos de proyecto claros"],
  sections:{services:"Diseñado para trabajo profesional",talent:"Especialistas para equipos globales",cta:"Crea trabajo excepcional con Gaza"},
  footer:"Oportunidades profesionales basadas en la confianza."
 },
 fr:{
  nav:{talent:"Trouver des talents",work:"Comment ça marche",trust:"Confiance",login:"Se connecter",join:"Rejoindre GazaWorks"},
  hero:{eyebrow:"Place de marché professionnelle vérifiée",title:"Recrutez des talents vérifiés de Gaza",body:"Travaillez avec des professionnels et des équipes grâce à des accords clairs, des échanges privés et des livraisons traçables.",primary:"Explorer les talents",secondary:"Publier une mission"},
  stats:["Vérification avec entretien en personne","Collaboration privée et responsable","Accords de projet clairs"],
  sections:{services:"Conçu pour le travail professionnel",talent:"Des spécialistes pour les équipes internationales",cta:"Créez un travail exceptionnel avec Gaza"},
  footer:"Des opportunités professionnelles fondées sur la confiance."
 },
 de:{
  nav:{talent:"Talente finden",work:"So funktioniert es",trust:"Vertrauen",login:"Anmelden",join:"GazaWorks beitreten"},
  hero:{eyebrow:"Verifizierter professioneller Marktplatz",title:"Verifizierte Talente aus Gaza beauftragen",body:"Arbeiten Sie mit Fachkräften und Teams über klare Vereinbarungen, private Kommunikation und nachvollziehbare Lieferprozesse.",primary:"Talente entdecken",secondary:"Auftrag veröffentlichen"},
  stats:["Verifizierung durch persönliches Gespräch","Private und verantwortliche Zusammenarbeit","Klare Projektvereinbarungen"],
  sections:{services:"Für professionelle Arbeit entwickelt",talent:"Spezialisten für internationale Teams",cta:"Hervorragende Arbeit mit Gaza schaffen"},
  footer:"Berufliche Chancen, aufgebaut auf Vertrauen."
 }
};
export function messages(locale:Locale){return copy[locale]??copy.en}
export function direction(locale:Locale){return locale==="ar"?"rtl":"ltr"}

