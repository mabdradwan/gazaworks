import type { Locale } from "@/lib/i18n";

export type EditorialSource = {
  tag: string;
  title: string;
  excerpt: string;
  detail: string;
  source: string;
  sourceDate: string;
  sourceUrl: string;
  imageUrl: string;
  imageCredit: string;
};

type BaseSource = {
  source: string;
  sourceDate: string;
  sourceUrl: string;
  imageUrl: string;
  imageCredit: string;
};

const sources: BaseSource[] = [
  {
    source: "Al Jazeera",
    sourceDate: "2026-08-06",
    sourceUrl: "https://www.aljazeera.net/politics/2026/8/6/%D8%B1%D8%BA%D9%85-%D8%A3%D8%B2%D9%85%D8%A9-%D8%A7%D9%84%D9%83%D9%87%D8%B1%D8%A8%D8%A7%D8%A1-%D9%88%D8%A7%D9%84%D8%A7%D8%AA%D8%B5%D8%A7%D9%84%D8%A7%D8%AA-%D8%A7%D9%84%D8%B9%D9%85%D9%84-%D8%B9%D9%86",
    imageUrl: "https://www.aljazeera.net/wp-content/uploads/2026/08/image-1786015963.jpg?quality=80&resize=730%2C410",
    imageCredit: "Al Jazeera",
  },
  {
    source: "Al Jazeera",
    sourceDate: "2026-07-01",
    sourceUrl: "https://www.aljazeera.net/news/2026/7/1/%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%D8%B9-%D8%A8%D8%AF%D9%8A%D9%84%D8%A9-%D9%88%D9%88%D8%B3%D8%A7%D8%A6%D9%84-%D8%A8%D8%AF%D8%A7%D8%A6%D9%8A%D8%A9-%D8%AC%D8%A7%D9%85%D8%B9%D9%8A%D9%88%D9%86",
    imageUrl: "https://www.aljazeera.net/wp-content/uploads/2026/07/image-1782906900.jpg?quality=80&resize=730%2C410",
    imageCredit: "Al Jazeera",
  },
  {
    source: "Al Jazeera",
    sourceDate: "2026-06-27",
    sourceUrl: "https://www.aljazeera.net/misc/2026/6/27/%D9%85%D8%A8%D8%A7%D8%AF%D8%B1%D8%A7%D8%AA-%D9%84%D8%AA%D8%A3%D9%87%D9%8A%D9%84-%D8%A7%D9%84%D8%B7%D9%84%D8%A8%D8%A9-%D9%84%D9%85%D9%88%D8%A7%D8%AC%D9%87%D8%A9-%D8%A7%D9%86%D9%87%D9%8A%D8%A7%D8%B1",
    imageUrl: "https://www.aljazeera.net/wp-content/uploads/2026/06/image-1782581142.jpg?quality=80&resize=730%2C410",
    imageCredit: "Al Jazeera",
  },
  {
    source: "Al Jazeera",
    sourceDate: "2026-03-17",
    sourceUrl: "https://www.aljazeera.net/ebusiness/2026/3/17/%D8%BA%D8%B2%D8%A9-%D8%A8%D8%B7%D8%A7%D9%84%D8%A9-%D9%81%D9%84%D8%B3%D8%B7%D9%8A%D9%86-%D8%AD%D8%B1%D8%A8-%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF",
    imageUrl: "https://www.aljazeera.net/wp-content/uploads/2026/02/7%D8%B9%D8%AA%D8%A7%D9%84-1771503628.jpg?quality=80&resize=770%2C513",
    imageCredit: "Al Jazeera",
  },
  {
    source: "Al Jazeera",
    sourceDate: "2026-05-01",
    sourceUrl: "https://www.aljazeera.net/politics/2026/5/1/%D8%B9%D9%85%D8%A7%D9%84-%D8%AA%D8%AC%D8%A7%D8%B1-%D8%BA%D8%B2%D8%A9-%D9%81%D9%84%D8%B3%D8%B7%D9%8A%D9%86-%D8%A8%D8%B3%D8%B7%D8%A7%D8%AA",
    imageUrl: "https://www.aljazeera.net/wp-content/uploads/2026/04/image-1777477564.jpg?quality=80&resize=730%2C410",
    imageCredit: "Al Jazeera",
  },
  {
    source: "UNDP",
    sourceDate: "2026-02-04",
    sourceUrl: "https://www.undp.org/stories/gaza-rebuilding-lives-through-service-community-and-employment-opportunities",
    imageUrl: "https://www.undp.org/sites/g/files/zskgke326/files/styles/image_with_credit_caption_wide_large_1920_x897_/public/2026-02/undp-papp-grounds-al-shifa-hospital.jpg?itok=iEFba-VT",
    imageCredit: "UNDP PAPP",
  },
  {
    source: "UNDP",
    sourceDate: "2026-06-15",
    sourceUrl: "https://www.undp.org/papp/press-releases/undp-and-ministries-national-economy-industry-and-labor-launch-gaza-income-and-market-activation-recovery-imar-programme",
    imageUrl: "https://www.undp.org/sites/g/files/zskgke326/files/styles/image_with_credit_caption_wide_large_1920_x897_/public/2026-06/undppapp_imar_zakaria09.jpg?itok=05Emcyev",
    imageCredit: "UNDP PAPP",
  },
];

type Localized = {
  sourceCta: string;
  showMore: string;
  showLess: string;
  updatedDaily: string;
  openArticle: string;
  closeArticle: string;
  detailSuffix: string;
  items: Array<{ tag: string; title: string; excerpt: string }>;
};

const localized: Record<Locale, Localized> = {
  ar: {
    sourceCta: "الانتقال إلى المصدر",
    showMore: "عرض 5 مقالات إضافية",
    showLess: "إخفاء المقالات الإضافية",
    updatedDaily: "7 ملخصات مختارة · تواريخ وروابط المصادر الأصلية مرفقة",
    openArticle: "اقرأ الملخص",
    closeArticle: "إغلاق الملخص",
    detailSuffix: "تعكس هذه المادة أثر الواقع المهني والاقتصادي على الأفراد في غزة، والحاجة إلى قنوات دخل وعمل أكثر استقرارًا واتصالًا بالأسواق خارج القطاع.",
    items: [
      { tag:"عمل عن بُعد", title:"العمل عن بُعد يبقى مصدر دخل لآلاف الغزيين رغم أزمات الكهرباء والاتصالات", excerpt:"الجزيرة ترصد استمرار العمل الرقمي مع عملاء خارج غزة رغم صعوبات الطاقة والإنترنت والبنية التحتية." },
      { tag:"مسارات بديلة", title:"جامعيون وحرفيون في غزة يصنعون بدائل بعد فقدان الوظائف والمسارات المهنية", excerpt:"قصص لخريجين وأصحاب مهن دفعتهم الحرب إلى مشاريع صغيرة وبدائل مؤقتة بعد تعطل وظائفهم الأصلية." },
      { tag:"تعليم وسوق عمل", title:"مبادرات شبابية تربط طلاب غزة بمهارات العصر وسوق العمل الرقمي", excerpt:"مراكز تدريب ومبادرات بديلة تحاول سد فجوة التعليم وربط الشباب بمهارات عملية قابلة للاستخدام." },
      { tag:"اقتصاد ودخل", title:"أكثر من 80% دون عمل: كيف تتعامل أسر غزة مع انهيار مصادر الدخل؟", excerpt:"تقرير اقتصادي يرصد التراجع الحاد في الدخل والبطالة والبحث عن وسائل جديدة لتغطية الاحتياجات اليومية." },
      { tag:"أصحاب الأعمال", title:"من أصحاب مصالح تجارية إلى البحث عن مصدر رزق جديد", excerpt:"الجزيرة توثق كيف غيّرت الحرب أوضاع رجال أعمال وأصحاب مصالح ودفعَتهم إلى إعادة بناء مصادر دخلهم." },
      { tag:"فرص عمل طارئة", title:"فرص عمل طارئة تدعم الأسر والخدمات الأساسية في غزة", excerpt:"UNDP يوثق فرص عمل في الصحة والتعليم والقطاع الخاص تساعد الأسر وتدعم استمرار الخدمات الأساسية." },
      { tag:"تعافٍ اقتصادي", title:"برنامج IMAR يربط استعادة الدخل بتنشيط الأسواق وتوليد فرص العمل", excerpt:"برنامج UNDP وشركائه يركز على سبل العيش والمؤسسات والأسواق وتطوير القوى العاملة ضمن مسار التعافي." },
    ],
  },
  en: {
    sourceCta: "Go to source",
    showMore: "Show 5 more articles",
    showLess: "Hide extra articles",
    updatedDaily: "7 selected summaries · original sources and dates included",
    openArticle: "Read summary",
    closeArticle: "Close summary",
    detailSuffix: "The reporting illustrates how professional and economic disruption affects people in Gaza and why more stable links to income and work beyond the local market matter.",
    items: [
      { tag:"Remote work", title:"Remote work remains an income source for thousands despite power and connectivity crises", excerpt:"Al Jazeera documents digital workers continuing to serve clients outside Gaza despite severe infrastructure constraints." },
      { tag:"Alternative paths", title:"Graduates and tradespeople build alternatives after losing jobs and professional paths", excerpt:"Stories of graduates and skilled workers turning to small projects and temporary alternatives after their original work was disrupted." },
      { tag:"Skills & education", title:"Youth initiatives connect Gaza students with modern skills and the digital labour market", excerpt:"Training centres and alternative initiatives are trying to bridge education gaps with practical, market-relevant skills." },
      { tag:"Income & economy", title:"More than 80% without work: how are Gaza families coping with collapsed income?", excerpt:"Economic reporting tracks the sharp fall in income, extreme unemployment and new ways families try to cover basic needs." },
      { tag:"Business owners", title:"From business ownership to rebuilding a source of livelihood", excerpt:"Al Jazeera documents how war transformed the lives of business owners and forced many to rebuild income from the ground up." },
      { tag:"Emergency employment", title:"Emergency jobs support families and essential services in Gaza", excerpt:"UNDP documents work opportunities in health, education and the private sector that help sustain households and services." },
      { tag:"Economic recovery", title:"IMAR links restored income with market activation and job creation", excerpt:"UNDP and partners focus on livelihoods, enterprise recovery, markets and workforce development as part of recovery." },
    ],
  },
  tr: {
    sourceCta: "Kaynağa git",
    showMore: "5 makale daha göster",
    showLess: "Ek makaleleri gizle",
    updatedDaily: "7 seçilmiş özet · özgün kaynak ve tarihler belirtilir",
    openArticle: "Özeti oku",
    closeArticle: "Özeti kapat",
    detailSuffix: "Bu haber, Gazze’deki mesleki ve ekonomik kesintilerin insanları nasıl etkilediğini ve yerel pazar dışındaki daha istikrarlı gelir ve iş bağlantılarının neden önemli olduğunu gösteriyor.",
    items: [
      { tag:"Uzaktan çalışma", title:"Elektrik ve bağlantı krizlerine rağmen uzaktan çalışma binlerce kişi için gelir kaynağı", excerpt:"Al Jazeera, ağır altyapı sorunlarına rağmen Gazze dışındaki müşteriler için çalışan dijital profesyonelleri belgeliyor." },
      { tag:"Alternatif yollar", title:"Mezunlar ve meslek sahipleri işlerini kaybettikten sonra yeni yollar kuruyor", excerpt:"Savaş nedeniyle eski işleri duran gençlerin küçük projelere ve geçici alternatiflere yöneldiği hikâyeler." },
      { tag:"Beceri ve eğitim", title:"Gençlik girişimleri öğrencileri modern beceriler ve dijital iş piyasasıyla buluşturuyor", excerpt:"Eğitim merkezleri ve alternatif girişimler pratik ve pazara uygun beceriler kazandırmaya çalışıyor." },
      { tag:"Gelir ve ekonomi", title:"%80’den fazlası işsiz: Gazze’de aileler çöken gelirle nasıl baş ediyor?", excerpt:"Ekonomik haber, gelirdeki sert düşüşü, yüksek işsizliği ve temel ihtiyaçları karşılama yollarını inceliyor." },
      { tag:"İşletme sahipleri", title:"İşletme sahipliğinden yeniden gelir kaynağı kurmaya", excerpt:"Al Jazeera, savaşın iş insanlarının hayatını nasıl değiştirdiğini ve yeni gelir yolları aramaya zorladığını aktarıyor." },
      { tag:"Acil istihdam", title:"Acil işler aileleri ve temel hizmetleri destekliyor", excerpt:"UNDP sağlık, eğitim ve özel sektörde haneleri ve hizmetleri destekleyen iş fırsatlarını belgeliyor." },
      { tag:"Ekonomik toparlanma", title:"IMAR gelir restorasyonunu pazar aktivasyonu ve istihdamla bağlıyor", excerpt:"UNDP ve ortakları geçim kaynakları, işletmeler, piyasalar ve iş gücü gelişimine odaklanıyor." },
    ],
  },
  es: {
    sourceCta: "Ir a la fuente",
    showMore: "Mostrar 5 artículos más",
    showLess: "Ocultar artículos extra",
    updatedDaily: "7 resúmenes seleccionados · fuentes y fechas originales incluidas",
    openArticle: "Leer resumen",
    closeArticle: "Cerrar resumen",
    detailSuffix: "La cobertura muestra cómo la disrupción profesional y económica afecta a la población de Gaza y por qué son importantes vínculos más estables con ingresos y trabajo fuera del mercado local.",
    items: [
      { tag:"Trabajo remoto", title:"El trabajo remoto sigue siendo una fuente de ingresos pese a las crisis de electricidad y conectividad", excerpt:"Al Jazeera documenta a profesionales digitales que siguen trabajando con clientes fuera de Gaza pese a graves limitaciones." },
      { tag:"Rutas alternativas", title:"Graduados y profesionales crean alternativas tras perder empleos y trayectorias", excerpt:"Historias de jóvenes que recurren a pequeños proyectos y soluciones temporales después de perder su trabajo original." },
      { tag:"Habilidades y educación", title:"Iniciativas juveniles conectan a estudiantes con habilidades modernas y el mercado digital", excerpt:"Centros de formación e iniciativas alternativas intentan cerrar la brecha educativa con habilidades prácticas." },
      { tag:"Ingresos y economía", title:"Más del 80% sin trabajo: cómo afrontan las familias de Gaza el colapso de los ingresos", excerpt:"El informe económico analiza la caída de ingresos, el desempleo extremo y nuevas formas de cubrir necesidades básicas." },
      { tag:"Empresarios", title:"De dirigir negocios a reconstruir una fuente de sustento", excerpt:"Al Jazeera documenta cómo la guerra cambió la vida de empresarios y comerciantes y los obligó a buscar nuevos ingresos." },
      { tag:"Empleo de emergencia", title:"El empleo de emergencia apoya a familias y servicios esenciales", excerpt:"El PNUD documenta oportunidades laborales en salud, educación y sector privado que sostienen hogares y servicios." },
      { tag:"Recuperación económica", title:"IMAR vincula recuperación de ingresos, activación del mercado y empleo", excerpt:"El PNUD y sus socios se centran en medios de vida, empresas, mercados y desarrollo de la fuerza laboral." },
    ],
  },
  fr: {
    sourceCta: "Voir la source",
    showMore: "Afficher 5 articles de plus",
    showLess: "Masquer les articles supplémentaires",
    updatedDaily: "7 résumés sélectionnés · sources et dates originales indiquées",
    openArticle: "Lire le résumé",
    closeArticle: "Fermer le résumé",
    detailSuffix: "Ces informations montrent l’impact des perturbations professionnelles et économiques sur la population de Gaza et l’importance de liens plus stables vers des revenus et du travail hors du marché local.",
    items: [
      { tag:"Travail à distance", title:"Le travail à distance reste une source de revenus malgré les crises d’électricité et de connexion", excerpt:"Al Jazeera documente le travail numérique pour des clients hors de Gaza malgré de fortes contraintes d’infrastructure." },
      { tag:"Parcours alternatifs", title:"Diplômés et professionnels construisent des alternatives après la perte d’emplois", excerpt:"Des jeunes se tournent vers de petits projets et des solutions temporaires après l’interruption de leur activité initiale." },
      { tag:"Compétences et éducation", title:"Des initiatives relient les étudiants aux compétences modernes et au marché numérique", excerpt:"Des centres de formation cherchent à combler les lacunes éducatives avec des compétences pratiques et pertinentes." },
      { tag:"Revenus et économie", title:"Plus de 80 % sans travail : comment les familles font face à l’effondrement des revenus", excerpt:"Le reportage économique suit la chute des revenus, le chômage extrême et les nouveaux moyens de couvrir les besoins essentiels." },
      { tag:"Entrepreneurs", title:"De la direction d’entreprise à la reconstruction d’un moyen de subsistance", excerpt:"Al Jazeera montre comment la guerre a bouleversé la vie de chefs d’entreprise contraints de rechercher de nouvelles sources de revenu." },
      { tag:"Emploi d’urgence", title:"L’emploi d’urgence soutient les familles et les services essentiels", excerpt:"Le PNUD documente des opportunités dans la santé, l’éducation et le secteur privé qui soutiennent ménages et services." },
      { tag:"Relance économique", title:"IMAR relie restauration des revenus, activation des marchés et emploi", excerpt:"Le PNUD et ses partenaires soutiennent les moyens de subsistance, les entreprises, les marchés et le développement de la main-d’œuvre." },
    ],
  },
  de: {
    sourceCta: "Zur Quelle",
    showMore: "5 weitere Artikel anzeigen",
    showLess: "Weitere Artikel ausblenden",
    updatedDaily: "7 ausgewählte Zusammenfassungen · Originalquellen und Daten angegeben",
    openArticle: "Zusammenfassung lesen",
    closeArticle: "Zusammenfassung schließen",
    detailSuffix: "Die Berichte zeigen, wie berufliche und wirtschaftliche Brüche Menschen in Gaza treffen und warum stabilere Zugänge zu Einkommen und Arbeit außerhalb des lokalen Marktes wichtig sind.",
    items: [
      { tag:"Remote-Arbeit", title:"Remote-Arbeit bleibt trotz Strom- und Verbindungskrisen eine Einkommensquelle", excerpt:"Al Jazeera dokumentiert digitale Fachkräfte, die trotz schwerer Infrastrukturprobleme weiter für Kunden außerhalb Gazas arbeiten." },
      { tag:"Alternative Wege", title:"Absolventen und Fachkräfte bauen nach Jobverlust neue Wege auf", excerpt:"Geschichten von jungen Menschen, die nach dem Wegfall ihrer ursprünglichen Arbeit auf kleine Projekte und Übergangslösungen setzen." },
      { tag:"Kompetenzen und Bildung", title:"Jugendinitiativen verbinden Studierende mit modernen Kompetenzen und digitaler Arbeit", excerpt:"Trainingszentren und alternative Initiativen versuchen Bildungslücken mit praxisnahen, marktrelevanten Fähigkeiten zu schließen." },
      { tag:"Einkommen und Wirtschaft", title:"Mehr als 80 % ohne Arbeit: wie Familien in Gaza mit eingebrochenem Einkommen umgehen", excerpt:"Der Wirtschaftsbericht beschreibt den starken Einkommensrückgang, extreme Arbeitslosigkeit und neue Wege zur Deckung grundlegender Bedürfnisse." },
      { tag:"Unternehmer", title:"Vom eigenen Unternehmen zum Neuaufbau einer Lebensgrundlage", excerpt:"Al Jazeera zeigt, wie der Krieg das Leben von Unternehmern verändert und sie zur Suche nach neuen Einkommensquellen zwingt." },
      { tag:"Notbeschäftigung", title:"Notbeschäftigung unterstützt Familien und grundlegende Dienste", excerpt:"UNDP dokumentiert Jobs in Gesundheit, Bildung und Privatsektor, die Haushalte und wichtige Dienste stützen." },
      { tag:"Wirtschaftliche Erholung", title:"IMAR verbindet Einkommen, Marktaktivierung und Beschäftigung", excerpt:"UNDP und Partner konzentrieren sich auf Lebensgrundlagen, Unternehmen, Märkte und die Entwicklung der Arbeitskräfte." },
    ],
  },
};

export function editorialSources(locale: Locale) {
  const text = localized[locale] ?? localized.en;
  return {
    sourceCta: text.sourceCta,
    showMore: text.showMore,
    showLess: text.showLess,
    updatedDaily: text.updatedDaily,
    openArticle: text.openArticle,
    closeArticle: text.closeArticle,
    items: text.items.map((item, index) => ({
      ...sources[index],
      ...item,
      detail: item.excerpt + " " + text.detailSuffix,
    })).sort((a, b) => b.sourceDate.localeCompare(a.sourceDate)),
  };
}
