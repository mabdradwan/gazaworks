import type { Locale } from "@/lib/i18n";

type HomeShowcaseCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  primary: string;
  secondary: string;
  proof: string;
  stats: Array<{ value: string; label: string }>;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
};

const copy: Record<Locale, HomeShowcaseCopy> = {
  ar: {
    eyebrow: "",
    title: "من غزة إلى العالم",
    subtitle: "المهارات لا تعرف الحدود",
    body: "GazaWorks تربط المواهب والفرق والشركات الناشئة في غزة بعملاء وجهات داعمة حول العالم، لفرص عمل حقيقية ومسار مهني أكثر استقرارًا.",
    primary: "ابدأ الآن",
    secondary: "اكتشف كيف نعمل",
    proof: "في غزة، قد تضيق الفرص. لكن المعرفة والعمل لا يتوقفان.",
    stats: [
      { value: "6", label: "لغات للمنصة" },
      { value: "3", label: "مسارات حساب واضحة" },
      { value: "✓", label: "توثيق مهني حضوري" },
      { value: "↗", label: "وصول إلى فرص عالمية" },
    ],
    ctaTitle: "كن جزءًا من التغيير",
    ctaBody: "سجّل الآن وابدأ رحلتك نحو فرصة مهنية حقيقية.",
    ctaButton: "إنشاء حساب مجاني",
  },
  en: {
    eyebrow: "",
    title: "From Gaza to the world",
    subtitle: "Skills have no borders",
    body: "GazaWorks connects professionals, teams, and startups in Gaza with clients and supporting organizations worldwide — for real work and more sustainable professional paths.",
    primary: "Get started",
    secondary: "See how it works",
    proof: "Opportunities can narrow. Knowledge, craft, and the will to work do not.",
    stats: [
      { value: "6", label: "platform languages" },
      { value: "3", label: "clear account paths" },
      { value: "✓", label: "in-person verification" },
      { value: "↗", label: "access to global work" },
    ],
    ctaTitle: "Be part of meaningful change",
    ctaBody: "Create your account and start moving toward a real professional opportunity.",
    ctaButton: "Create a free account",
  },
  tr: {
    eyebrow: "",
    title: "Gazze’den dünyaya",
    subtitle: "Beceriler sınır tanımaz",
    body: "GazaWorks, Gazze’deki profesyonelleri, ekipleri ve girişimleri dünya çapındaki müşteriler ve destekleyici kuruluşlarla gerçek iş fırsatları için buluşturur.",
    primary: "Şimdi başla",
    secondary: "Nasıl çalıştığını gör",
    proof: "Fırsatlar daralabilir; bilgi, üretme gücü ve çalışma isteği durmaz.",
    stats: [
      { value: "6", label: "platform dili" },
      { value: "3", label: "net hesap yolu" },
      { value: "✓", label: "yüz yüze doğrulama" },
      { value: "↗", label: "küresel iş erişimi" },
    ],
    ctaTitle: "Değişimin bir parçası olun",
    ctaBody: "Hesabınızı oluşturun ve gerçek bir profesyonel fırsata doğru yolculuğunuza başlayın.",
    ctaButton: "Ücretsiz hesap oluştur",
  },
  es: {
    eyebrow: "",
    title: "De Gaza al mundo",
    subtitle: "El talento no conoce fronteras",
    body: "GazaWorks conecta profesionales, equipos y startups de Gaza con clientes y organizaciones de apoyo de todo el mundo para crear oportunidades laborales reales.",
    primary: "Empieza ahora",
    secondary: "Descubre cómo funciona",
    proof: "Las oportunidades pueden reducirse; el conocimiento, el oficio y las ganas de trabajar no desaparecen.",
    stats: [
      { value: "6", label: "idiomas de la plataforma" },
      { value: "3", label: "rutas de cuenta claras" },
      { value: "✓", label: "verificación presencial" },
      { value: "↗", label: "acceso a trabajo global" },
    ],
    ctaTitle: "Forma parte del cambio",
    ctaBody: "Crea tu cuenta y empieza tu camino hacia una oportunidad profesional real.",
    ctaButton: "Crear cuenta gratuita",
  },
  fr: {
    eyebrow: "",
    title: "De Gaza vers le monde",
    subtitle: "Les compétences n’ont pas de frontières",
    body: "GazaWorks relie les professionnels, équipes et startups de Gaza à des clients et organisations de soutien dans le monde afin de créer de vraies opportunités de travail.",
    primary: "Commencer",
    secondary: "Voir comment ça marche",
    proof: "Les opportunités peuvent se réduire ; le savoir-faire et la volonté de travailler restent.",
    stats: [
      { value: "6", label: "langues de la plateforme" },
      { value: "3", label: "parcours de compte clairs" },
      { value: "✓", label: "vérification en personne" },
      { value: "↗", label: "accès au travail mondial" },
    ],
    ctaTitle: "Prenez part au changement",
    ctaBody: "Créez votre compte et commencez votre parcours vers une vraie opportunité professionnelle.",
    ctaButton: "Créer un compte gratuit",
  },
  de: {
    eyebrow: "",
    title: "Von Gaza in die Welt",
    subtitle: "Kompetenz kennt keine Grenzen",
    body: "GazaWorks verbindet Fachkräfte, Teams und Startups aus Gaza mit Kunden und unterstützenden Organisationen weltweit, um echte Arbeitsmöglichkeiten zu schaffen.",
    primary: "Jetzt starten",
    secondary: "So funktioniert es",
    proof: "Chancen können knapper werden; Wissen, Können und Arbeitswille bleiben.",
    stats: [
      { value: "6", label: "Plattformsprachen" },
      { value: "3", label: "klare Kontowege" },
      { value: "✓", label: "persönliche Verifizierung" },
      { value: "↗", label: "Zugang zu globaler Arbeit" },
    ],
    ctaTitle: "Werden Sie Teil der Veränderung",
    ctaBody: "Erstellen Sie Ihr Konto und beginnen Sie den Weg zu einer echten beruflichen Chance.",
    ctaButton: "Kostenloses Konto erstellen",
  },
};

export function homeShowcaseCopy(locale: Locale) {
  return copy[locale] ?? copy.en;
}
