import type { Locale } from "@/lib/i18n";

export type EditorialSource = {
  tag: string;
  title: string;
  excerpt: string;
  source: string;
  sourceDate: string;
  sourceUrl: string;
};

const alJazeeraJobs = "https://www.aljazeera.net/video/2026/9/15/%D8%A3%D8%B5%D8%AD%D8%A7%D8%A8-%D8%A7%D9%84%D9%85%D9%87%D9%86-%D9%88%D8%A7%D9%84%D9%83%D9%81%D8%A7%D8%A1%D8%A7%D8%AA-%D9%81%D9%8A-%D8%BA%D8%B2%D8%A9-%D9%8A%D9%81%D9%82%D8%AF%D9%88%D9%86";
const alJazeeraRemote = "https://www.aljazeera.net/politics/2026/8/6/%D8%B1%D8%BA%D9%85-%D8%A3%D8%B2%D9%85%D8%A9-%D8%A7%D9%84%D9%83%D9%87%D8%B1%D8%A8%D8%A7%D8%A1-%D9%88%D8%A7%D9%84%D8%A7%D8%AA%D8%B5%D8%A7%D9%84%D8%A7%D8%AA-%D8%A7%D9%84%D8%B9%D9%85%D9%84-%D8%B9%D9%86";
const undpImar = "https://www.undp.org/papp/press-releases/undp-and-ministries-national-economy-industry-and-labor-launch-gaza-income-and-market-activation-recovery-imar-programme";

const copy: Record<Locale, { sourceCta: string; items: EditorialSource[] }> = {
  ar: {
    sourceCta: "اطّلع على المصدر",
    items: [
      { tag: "العمل والبطالة", title: "بطالة غزة تقترب من 80%.. ماذا يعني ذلك لأصحاب المهن؟", excerpt: "تقرير للجزيرة في 15 سبتمبر 2026، مستندًا إلى بيانات منظمة العمل الدولية والجهاز المركزي للإحصاء الفلسطيني، يسلّط الضوء على فقدان أصحاب المهن وظائفهم واتساع أزمة البطالة في غزة.", source: "الجزيرة", sourceDate: "15 سبتمبر 2026", sourceUrl: alJazeeraJobs },
      { tag: "العمل عن بُعد", title: "رغم أزمات الكهرباء والاتصالات.. العمل عن بُعد يبقى مصدر دخل لآلاف الغزيين", excerpt: "وثّقت الجزيرة استمرار آلاف العاملين في غزة في الاعتماد على العمل الرقمي مع عملاء خارج القطاع، رغم تحديات الطاقة والاتصال والبنية التحتية.", source: "الجزيرة", sourceDate: "6 أغسطس 2026", sourceUrl: alJazeeraRemote },
      { tag: "التعافي الاقتصادي", title: "من استعادة الدخل إلى فرص العمل: برنامج IMAR يستهدف إعادة تنشيط أسواق غزة", excerpt: "أطلق برنامج الأمم المتحدة الإنمائي وشركاؤه برنامج IMAR لدعم استعادة سبل العيش وتنشيط الأسواق والمؤسسات وتوليد فرص العمل ضمن مسار التعافي الاقتصادي.", source: "برنامج الأمم المتحدة الإنمائي", sourceDate: "15 يونيو 2026", sourceUrl: undpImar },
    ],
  },
  en: {
    sourceCta: "View source",
    items: [
      { tag: "Jobs & unemployment", title: "Gaza unemployment nears 80% — what does that mean for skilled workers?", excerpt: "A 15 September 2026 Al Jazeera report, citing ILO and PCBS data, examines widespread job loss among professionals and the severe unemployment crisis in Gaza.", source: "Al Jazeera", sourceDate: "15 Sep 2026", sourceUrl: alJazeeraJobs },
      { tag: "Remote work", title: "Despite power and connectivity crises, remote work remains income for thousands in Gaza", excerpt: "Al Jazeera documented how thousands of workers continue serving clients outside Gaza through digital work despite electricity, internet, and infrastructure constraints.", source: "Al Jazeera", sourceDate: "6 Aug 2026", sourceUrl: alJazeeraRemote },
      { tag: "Economic recovery", title: "From restoring income to creating jobs: IMAR targets market recovery in Gaza", excerpt: "UNDP and Palestinian partners launched IMAR to support livelihoods, enterprise recovery, market activation, workforce development, and employment generation.", source: "UNDP", sourceDate: "15 Jun 2026", sourceUrl: undpImar },
    ],
  },
  tr: {
    sourceCta: "Kaynağı görüntüle",
    items: [
      { tag: "İş & işsizlik", title: "Gazze’de işsizlik %80’e yaklaşıyor: nitelikli çalışanlar için ne anlama geliyor?", excerpt: "El Cezire’nin 15 Eylül 2026 tarihli, ILO ve PCBS verilerine dayanan haberi; meslek sahiplerinin iş kaybını ve Gazze’deki ağır işsizlik krizini ele alıyor.", source: "Al Jazeera", sourceDate: "15 Eyl 2026", sourceUrl: alJazeeraJobs },
      { tag: "Uzaktan çalışma", title: "Elektrik ve bağlantı krizlerine rağmen uzaktan çalışma binlerce Gazzeli için gelir kaynağı", excerpt: "El Cezire, elektrik, internet ve altyapı sorunlarına rağmen binlerce kişinin Gazze dışındaki müşteriler için dijital çalışmayı sürdürdüğünü belgeledi.", source: "Al Jazeera", sourceDate: "6 Ağu 2026", sourceUrl: alJazeeraRemote },
      { tag: "Ekonomik toparlanma", title: "Geliri yeniden kurmaktan istihdama: IMAR Gazze’de piyasaları canlandırmayı hedefliyor", excerpt: "UNDP ve Filistinli ortaklar, geçim kaynaklarını, işletme toparlanmasını, pazar aktivasyonunu ve istihdam yaratmayı desteklemek için IMAR programını başlattı.", source: "UNDP", sourceDate: "15 Haz 2026", sourceUrl: undpImar },
    ],
  },
  es: {
    sourceCta: "Ver fuente",
    items: [
      { tag: "Empleo y desempleo", title: "El desempleo en Gaza se acerca al 80%: ¿qué implica para los profesionales?", excerpt: "Un reportaje de Al Jazeera del 15 de septiembre de 2026, basado en datos de la OIT y PCBS, analiza la pérdida de empleo entre profesionales y la crisis laboral en Gaza.", source: "Al Jazeera", sourceDate: "15 sep 2026", sourceUrl: alJazeeraJobs },
      { tag: "Trabajo remoto", title: "Pese a la crisis eléctrica y de conectividad, el trabajo remoto sigue sosteniendo ingresos en Gaza", excerpt: "Al Jazeera documentó cómo miles de trabajadores siguen atendiendo a clientes fuera de Gaza mediante trabajo digital pese a los límites de electricidad, internet e infraestructura.", source: "Al Jazeera", sourceDate: "6 ago 2026", sourceUrl: alJazeeraRemote },
      { tag: "Recuperación económica", title: "De recuperar ingresos a crear empleo: IMAR busca reactivar los mercados de Gaza", excerpt: "El PNUD y sus socios palestinos lanzaron IMAR para apoyar medios de vida, recuperación empresarial, activación del mercado y generación de empleo.", source: "PNUD", sourceDate: "15 jun 2026", sourceUrl: undpImar },
    ],
  },
  fr: {
    sourceCta: "Voir la source",
    items: [
      { tag: "Emploi & chômage", title: "Le chômage à Gaza approche 80 % : quelles conséquences pour les professionnels ?", excerpt: "Un reportage d’Al Jazeera du 15 septembre 2026, s’appuyant sur des données de l’OIT et du PCBS, décrit la perte d’emplois et l’ampleur de la crise du travail à Gaza.", source: "Al Jazeera", sourceDate: "15 sept. 2026", sourceUrl: alJazeeraJobs },
      { tag: "Travail à distance", title: "Malgré les crises d’électricité et de connexion, le travail à distance reste une source de revenus à Gaza", excerpt: "Al Jazeera a documenté la poursuite du travail numérique pour des clients hors de Gaza malgré les contraintes d’électricité, d’internet et d’infrastructure.", source: "Al Jazeera", sourceDate: "6 août 2026", sourceUrl: alJazeeraRemote },
      { tag: "Relance économique", title: "Du revenu à l’emploi : IMAR vise à réactiver les marchés de Gaza", excerpt: "Le PNUD et ses partenaires palestiniens ont lancé IMAR pour soutenir les moyens de subsistance, les entreprises, l’activation des marchés et la création d’emplois.", source: "PNUD", sourceDate: "15 juin 2026", sourceUrl: undpImar },
    ],
  },
  de: {
    sourceCta: "Quelle ansehen",
    items: [
      { tag: "Arbeit & Arbeitslosigkeit", title: "Arbeitslosigkeit in Gaza nähert sich 80 % – was bedeutet das für Fachkräfte?", excerpt: "Ein Al-Jazeera-Bericht vom 15. September 2026, der sich auf ILO- und PCBS-Daten stützt, beleuchtet Jobverluste unter Fachkräften und die schwere Arbeitsmarktkrise in Gaza.", source: "Al Jazeera", sourceDate: "15. Sep. 2026", sourceUrl: alJazeeraJobs },
      { tag: "Remote-Arbeit", title: "Trotz Strom- und Verbindungsproblemen bleibt Remote-Arbeit für Tausende in Gaza eine Einkommensquelle", excerpt: "Al Jazeera dokumentierte, wie Tausende trotz Strom-, Internet- und Infrastrukturbeschränkungen weiter digital für Kunden außerhalb Gazas arbeiten.", source: "Al Jazeera", sourceDate: "6. Aug. 2026", sourceUrl: alJazeeraRemote },
      { tag: "Wirtschaftliche Erholung", title: "Von Einkommen zu Beschäftigung: IMAR soll Gazas Märkte wieder aktivieren", excerpt: "UNDP und palästinensische Partner starteten IMAR, um Lebensgrundlagen, Unternehmen, Marktaktivierung und die Schaffung von Arbeitsplätzen zu unterstützen.", source: "UNDP", sourceDate: "15. Juni 2026", sourceUrl: undpImar },
    ],
  },
};

export function editorialSources(locale: Locale) {
  return copy[locale] ?? copy.en;
}
