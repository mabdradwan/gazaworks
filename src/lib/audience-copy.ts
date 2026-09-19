import type { Locale } from "@/lib/i18n";

type AudienceItem = {
  key: "individual" | "team" | "client" | "supporter";
  href: string;
  title: string;
  body: string;
  cta: string;
};

type AudienceCopy = {
  eyebrow: string;
  title: string;
  body: string;
  items: AudienceItem[];
};

const copy: Record<Locale, AudienceCopy> = {
  ar: {
    eyebrow: "اختر طريقك",
    title: "مسار واضح لكل شخص وجهة.",
    body: "أربع نقاط دخول بسيطة توصل كل زائر مباشرة إلى ما يحتاجه.",
    items: [
      { key: "individual", href: "/auth?mode=register&type=individual", title: "أفراد من غزة", body: "اعرض مهاراتك وابنِ ملفك المهني واصل إلى فرص عمل حقيقية.", cta: "ابدأ كفرد" },
      { key: "team", href: "/auth?mode=register&type=team", title: "فرق وشركات ناشئة", body: "قدّم خدماتك كفريق ووسّع نطاق عملك خارج غزة.", cta: "ابدأ كفريق" },
      { key: "client", href: "/auth?mode=register&type=client", title: "عملاء وجهات خارج غزة", body: "ابحث عن مواهب موثقة وابدأ تعاونًا في مشاريع مؤثرة.", cta: "ابحث عن مواهب" },
      { key: "supporter", href: "/contact", title: "مؤسسات وداعمون", body: "ادعم المواهب وساهم في خلق فرص اقتصادية ومهنية حقيقية.", cta: "اكتشف فرص الدعم" },
    ],
  },
  en: {
    eyebrow: "Choose your path",
    title: "A clear route for every person and organization.",
    body: "Four simple entry points take every visitor straight to what they need.",
    items: [
      { key: "individual", href: "/auth?mode=register&type=individual", title: "Individuals in Gaza", body: "Show your skills, build your professional profile, and reach real work opportunities.", cta: "Start as an individual" },
      { key: "team", href: "/auth?mode=register&type=team", title: "Teams and startups", body: "Present your services as a team and expand your work beyond Gaza.", cta: "Start as a team" },
      { key: "client", href: "/auth?mode=register&type=client", title: "Clients outside Gaza", body: "Find verified talent and begin meaningful project collaboration.", cta: "Find talent" },
      { key: "supporter", href: "/contact", title: "Organizations and supporters", body: "Support skilled people and help create sustainable professional opportunities.", cta: "Explore support paths" },
    ],
  },
  tr: {
    eyebrow: "Yolunu seç",
    title: "Her kişi ve kurum için net bir başlangıç.",
    body: "Dört basit giriş noktası her ziyaretçiyi doğrudan ihtiyacına götürür.",
    items: [
      { key: "individual", href: "/auth?mode=register&type=individual", title: "Gazze’deki bireyler", body: "Becerilerini göster, profesyonel profilini oluştur ve gerçek iş fırsatlarına ulaş.", cta: "Bireysel başla" },
      { key: "team", href: "/auth?mode=register&type=team", title: "Ekipler ve girişimler", body: "Hizmetlerinizi ekip olarak sunun ve çalışma alanınızı Gazze dışına taşıyın.", cta: "Ekip olarak başla" },
      { key: "client", href: "/auth?mode=register&type=client", title: "Gazze dışındaki müşteriler", body: "Doğrulanmış yetenekleri bulun ve etkili projelerde iş birliğine başlayın.", cta: "Yetenek bul" },
      { key: "supporter", href: "/contact", title: "Kurumlar ve destekçiler", body: "Nitelikli insanları destekleyin ve sürdürülebilir mesleki fırsatların oluşmasına katkı sağlayın.", cta: "Destek yollarını keşfet" },
    ],
  },
  es: {
    eyebrow: "Elige tu camino",
    title: "Una ruta clara para cada persona y organización.",
    body: "Cuatro puntos de entrada llevan a cada visitante directamente a lo que necesita.",
    items: [
      { key: "individual", href: "/auth?mode=register&type=individual", title: "Personas en Gaza", body: "Muestra tus habilidades, crea tu perfil profesional y accede a oportunidades de trabajo reales.", cta: "Empezar como profesional" },
      { key: "team", href: "/auth?mode=register&type=team", title: "Equipos y startups", body: "Presenta tus servicios como equipo y amplía tu trabajo fuera de Gaza.", cta: "Empezar como equipo" },
      { key: "client", href: "/auth?mode=register&type=client", title: "Clientes fuera de Gaza", body: "Encuentra talento verificado y empieza a colaborar en proyectos de impacto.", cta: "Buscar talento" },
      { key: "supporter", href: "/contact", title: "Organizaciones y colaboradores", body: "Apoya a profesionales cualificados y contribuye a crear oportunidades sostenibles.", cta: "Explorar formas de apoyo" },
    ],
  },
  fr: {
    eyebrow: "Choisissez votre parcours",
    title: "Un chemin clair pour chaque personne et organisation.",
    body: "Quatre points d’entrée simples conduisent chaque visiteur directement vers ce dont il a besoin.",
    items: [
      { key: "individual", href: "/auth?mode=register&type=individual", title: "Professionnels à Gaza", body: "Présentez vos compétences, construisez votre profil et accédez à de vraies opportunités de travail.", cta: "Commencer comme professionnel" },
      { key: "team", href: "/auth?mode=register&type=team", title: "Équipes et startups", body: "Présentez vos services en équipe et développez votre activité au-delà de Gaza.", cta: "Commencer comme équipe" },
      { key: "client", href: "/auth?mode=register&type=client", title: "Clients hors de Gaza", body: "Trouvez des talents vérifiés et commencez à collaborer sur des projets utiles.", cta: "Trouver des talents" },
      { key: "supporter", href: "/contact", title: "Organisations et soutiens", body: "Soutenez les compétences et contribuez à créer des opportunités professionnelles durables.", cta: "Découvrir les formes de soutien" },
    ],
  },
  de: {
    eyebrow: "Wählen Sie Ihren Weg",
    title: "Ein klarer Einstieg für jede Person und Organisation.",
    body: "Vier einfache Einstiegspunkte führen jeden Besucher direkt zum passenden nächsten Schritt.",
    items: [
      { key: "individual", href: "/auth?mode=register&type=individual", title: "Einzelpersonen in Gaza", body: "Zeigen Sie Ihre Fähigkeiten, bauen Sie Ihr Profil auf und erreichen Sie echte Arbeitsmöglichkeiten.", cta: "Als Einzelperson starten" },
      { key: "team", href: "/auth?mode=register&type=team", title: "Teams und Startups", body: "Präsentieren Sie Ihre Leistungen als Team und erweitern Sie Ihre Arbeit über Gaza hinaus.", cta: "Als Team starten" },
      { key: "client", href: "/auth?mode=register&type=client", title: "Kunden außerhalb Gazas", body: "Finden Sie verifizierte Talente und starten Sie die Zusammenarbeit an sinnvollen Projekten.", cta: "Talente finden" },
      { key: "supporter", href: "/contact", title: "Organisationen und Unterstützer", body: "Unterstützen Sie qualifizierte Menschen und helfen Sie, nachhaltige berufliche Chancen zu schaffen.", cta: "Unterstützung entdecken" },
    ],
  },
};

export function audienceCopy(locale: Locale) {
  return copy[locale] ?? copy.en;
}
