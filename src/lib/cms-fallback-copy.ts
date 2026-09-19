import type { Locale } from "@/lib/i18n";

type CmsFallback = {
  about: { title: string; description: string };
  how: { title: string; description: string };
};

const copy: Record<Locale, CmsFallback> = {
  en: {
    about: {
      title: "About GazaWorks",
      description: "GazaWorks connects verified professionals and teams in Gaza with clients and organizations around the world through a trusted, structured professional marketplace.",
    },
    how: {
      title: "How GazaWorks works",
      description: "Discover verified talent, agree on a clear scope, collaborate in one workspace, deliver the work, and keep every important step documented.",
    },
  },
  ar: {
    about: {
      title: "عن غزة ووركس",
      description: "تربط غزة ووركس المهنيين والفرق الموثقة في غزة بعملاء ومؤسسات حول العالم من خلال سوق مهني منظم ومبني على الثقة.",
    },
    how: {
      title: "كيف تعمل غزة ووركس؟",
      description: "اكتشف مواهب موثقة، اتفق على نطاق عمل واضح، تعاون داخل مساحة واحدة، سلّم العمل، واحتفظ بكل خطوة مهمة موثقة.",
    },
  },
  tr: {
    about: {
      title: "GazaWorks hakkında",
      description: "GazaWorks, Gazze’deki doğrulanmış profesyonelleri ve ekipleri güvenilir ve yapılandırılmış bir profesyonel pazar üzerinden dünyadaki müşteriler ve kuruluşlarla buluşturur.",
    },
    how: {
      title: "GazaWorks nasıl çalışır?",
      description: "Doğrulanmış yetenekleri keşfedin, net bir kapsam üzerinde anlaşın, tek bir çalışma alanında iş birliği yapın, işi teslim edin ve önemli adımları kayıt altında tutun.",
    },
  },
  es: {
    about: {
      title: "Acerca de GazaWorks",
      description: "GazaWorks conecta a profesionales y equipos verificados de Gaza con clientes y organizaciones de todo el mundo mediante un mercado profesional estructurado y basado en la confianza.",
    },
    how: {
      title: "Cómo funciona GazaWorks",
      description: "Descubre talento verificado, acuerda un alcance claro, colabora en un único espacio, entrega el trabajo y conserva documentado cada paso importante.",
    },
  },
  fr: {
    about: {
      title: "À propos de GazaWorks",
      description: "GazaWorks met en relation des professionnels et équipes vérifiés à Gaza avec des clients et organisations du monde entier grâce à une place de marché professionnelle structurée et fondée sur la confiance.",
    },
    how: {
      title: "Comment fonctionne GazaWorks ?",
      description: "Découvrez des talents vérifiés, définissez clairement la mission, collaborez dans un même espace, livrez le travail et gardez chaque étape importante documentée.",
    },
  },
  de: {
    about: {
      title: "Über GazaWorks",
      description: "GazaWorks verbindet verifizierte Fachkräfte und Teams in Gaza mit Kunden und Organisationen weltweit über einen vertrauenswürdigen und strukturierten professionellen Marktplatz.",
    },
    how: {
      title: "So funktioniert GazaWorks",
      description: "Entdecken Sie verifizierte Talente, vereinbaren Sie einen klaren Umfang, arbeiten Sie in einem gemeinsamen Bereich zusammen, liefern Sie die Arbeit und dokumentieren Sie jeden wichtigen Schritt.",
    },
  },
};

export function cmsFallbackCopy(locale: Locale) {
  return copy[locale] ?? copy.en;
}
