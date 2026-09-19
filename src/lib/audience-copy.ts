import type { Locale } from "@/lib/i18n";

type AudienceItem = {
  type: "individual" | "team" | "client";
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
    eyebrow: "ابدأ من مكانك",
    title: "مسار واضح لكل نوع حساب.",
    body: "اختر الدور الأقرب لك، وسنأخذك مباشرة إلى تجربة التسجيل المناسبة بدون خطوات مربكة.",
    items: [
      { type: "individual", title: "أنا محترف من غزة", body: "أنشئ ملفًا مهنيًا يعرض مهاراتك وخبراتك وأعمالك، واستعد للوصول إلى فرص حقيقية خارج السوق المحلي.", cta: "ابدأ كفرد" },
      { type: "team", title: "نحن فريق أو شركة ناشئة", body: "قدّم خدمات فريقك وأعضاءه وأعماله السابقة في ملف واحد واضح للعملاء والمؤسسات.", cta: "ابدأ كفريق" },
      { type: "client", title: "أنا عميل أو مؤسسة", body: "اكتشف المواهب والفرق الموثقة من غزة، أو انشر طلب عمل واضح وابدأ التعاون.", cta: "ابدأ كعميل" },
    ],
  },
  en: {
    eyebrow: "Start where you are",
    title: "A clear path for every account.",
    body: "Choose the role that fits you and go straight into the right onboarding flow without unnecessary steps.",
    items: [
      { type: "individual", title: "I’m a professional in Gaza", body: "Build a professional profile for your skills, experience, and portfolio, and prepare to reach real opportunities beyond the local market.", cta: "Start as an individual" },
      { type: "team", title: "We’re a team or startup", body: "Present your services, members, and previous work in one clear profile for clients and organizations.", cta: "Start as a team" },
      { type: "client", title: "I’m a client or organization", body: "Discover verified professionals and teams from Gaza, or publish a clear work request and start collaborating.", cta: "Start as a client" },
    ],
  },
  tr: {
    eyebrow: "Bulunduğun yerden başla",
    title: "Her hesap türü için net bir yol.",
    body: "Sana uygun rolü seç ve gereksiz adımlar olmadan doğru kayıt akışına geç.",
    items: [
      { type: "individual", title: "Gazze’de çalışan bir profesyonelim", body: "Becerilerini, deneyimini ve portföyünü sergileyen profesyonel bir profil oluştur ve yerel pazarın ötesindeki fırsatlara hazırlan.", cta: "Bireysel olarak başla" },
      { type: "team", title: "Bir ekip veya girişimiz", body: "Hizmetlerinizi, ekip üyelerinizi ve önceki çalışmalarınızı müşteriler için tek ve açık bir profilde sunun.", cta: "Ekip olarak başla" },
      { type: "client", title: "Müşteri veya kurumum", body: "Gazze’den doğrulanmış profesyonelleri ve ekipleri keşfedin veya bir iş talebi yayımlayıp iş birliğine başlayın.", cta: "Müşteri olarak başla" },
    ],
  },
  es: {
    eyebrow: "Empieza desde tu lugar",
    title: "Un camino claro para cada tipo de cuenta.",
    body: "Elige el rol que mejor te representa y entra directamente en el registro adecuado, sin pasos innecesarios.",
    items: [
      { type: "individual", title: "Soy profesional en Gaza", body: "Crea un perfil profesional con tus habilidades, experiencia y portfolio, y prepárate para acceder a oportunidades fuera del mercado local.", cta: "Empezar como profesional" },
      { type: "team", title: "Somos un equipo o startup", body: "Presenta servicios, integrantes y trabajos previos en un perfil claro para clientes y organizaciones.", cta: "Empezar como equipo" },
      { type: "client", title: "Soy cliente u organización", body: "Descubre profesionales y equipos verificados de Gaza o publica una solicitud de trabajo e inicia la colaboración.", cta: "Empezar como cliente" },
    ],
  },
  fr: {
    eyebrow: "Commencez depuis votre situation",
    title: "Un parcours clair pour chaque type de compte.",
    body: "Choisissez le rôle qui vous correspond et accédez directement au bon parcours d’inscription, sans étapes inutiles.",
    items: [
      { type: "individual", title: "Je suis professionnel à Gaza", body: "Créez un profil professionnel pour vos compétences, votre expérience et votre portfolio, puis préparez-vous à accéder à des opportunités hors du marché local.", cta: "Commencer comme professionnel" },
      { type: "team", title: "Nous sommes une équipe ou une startup", body: "Présentez vos services, vos membres et vos réalisations dans un profil clair destiné aux clients et organisations.", cta: "Commencer comme équipe" },
      { type: "client", title: "Je suis client ou organisation", body: "Découvrez des professionnels et équipes vérifiés de Gaza, ou publiez une demande de mission et commencez à collaborer.", cta: "Commencer comme client" },
    ],
  },
  de: {
    eyebrow: "Starten Sie von Ihrem Ausgangspunkt",
    title: "Ein klarer Weg für jeden Kontotyp.",
    body: "Wählen Sie die passende Rolle und gelangen Sie ohne unnötige Schritte direkt zum richtigen Registrierungsablauf.",
    items: [
      { type: "individual", title: "Ich bin eine Fachkraft in Gaza", body: "Erstellen Sie ein professionelles Profil für Fähigkeiten, Erfahrung und Portfolio und bereiten Sie sich auf Chancen außerhalb des lokalen Marktes vor.", cta: "Als Einzelperson starten" },
      { type: "team", title: "Wir sind ein Team oder Startup", body: "Präsentieren Sie Leistungen, Mitglieder und bisherige Arbeiten in einem klaren Profil für Kunden und Organisationen.", cta: "Als Team starten" },
      { type: "client", title: "Ich bin Kunde oder Organisation", body: "Entdecken Sie verifizierte Fachkräfte und Teams aus Gaza oder veröffentlichen Sie einen Arbeitsauftrag und starten Sie die Zusammenarbeit.", cta: "Als Kunde starten" },
    ],
  },
};

export function audienceCopy(locale: Locale) {
  return copy[locale] ?? copy.en;
}
