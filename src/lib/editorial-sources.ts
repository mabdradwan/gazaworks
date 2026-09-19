import type { Locale } from "@/lib/i18n";

export type EditorialSource = {
  tag: string;
  title: string;
  excerpt: string;
  detail: string;
  source: string;
  sourceDate: string;
  sourceUrl: string;
};

const links = {
  ajJobs: "https://www.aljazeera.net/video/2026/9/15/%D8%A3%D8%B5%D8%AD%D8%A7%D8%A8-%D8%A7%D9%84%D9%85%D9%87%D9%86-%D9%88%D8%A7%D9%84%D9%83%D9%81%D8%A7%D8%A1%D8%A7%D8%AA-%D9%81%D9%8A-%D8%BA%D8%B2%D8%A9-%D9%8A%D9%81%D9%82%D8%AF%D9%88%D9%86",
  ajRemote: "https://www.aljazeera.net/politics/2026/8/6/%D8%B1%D8%BA%D9%85-%D8%A3%D8%B2%D9%85%D8%A9-%D8%A7%D9%84%D9%83%D9%87%D8%B1%D8%A8%D8%A7%D8%A1-%D9%88%D8%A7%D9%84%D8%A7%D8%AA%D8%B5%D8%A7%D9%84%D8%A7%D8%AA-%D8%A7%D9%84%D8%B9%D9%85%D9%84-%D8%B9%D9%86",
  imar: "https://www.undp.org/papp/press-releases/undp-and-ministries-national-economy-industry-and-labor-launch-gaza-income-and-market-activation-recovery-imar-programme",
  undpJobs: "https://www.undp.org/stories/gaza-rebuilding-lives-through-service-community-and-employment-opportunities",
  ilo: "https://www.ilo.org/publications/labour-market-update-and-recovery-outlook-occupied-palestinian-territory",
  wbEconomy: "https://thedocs.worldbank.org/en/doc/caf69bb9db6d729c6b35254c5815df9a-0280012026/economic-update-on-the-west-bank-and-gaza",
  wbRnda: "https://thedocs.worldbank.org/en/doc/e539cbf23b348c3d4fc69b8a7e9c9d7d-0280062026/",
};

type EditorialBundle = {
  sourceCta: string;
  showMore: string;
  showLess: string;
  updatedDaily: string;
  openArticle: string;
  closeArticle: string;
  items: EditorialSource[];
};

const ar: EditorialBundle = {
  sourceCta: "الانتقال إلى المصدر",
  showMore: "عرض 5 مقالات إضافية",
  showLess: "إخفاء المقالات الإضافية",
  updatedDaily: "سبعة اختيارات تحريرية · الواجهة جاهزة للتحديث اليومي",
  openArticle: "اقرأ الملخص",
  closeArticle: "إغلاق الملخص",
  items: [
    { tag:"سوق العمل", title:"فقدان الوظائف يضغط على أصحاب المهن والكفاءات في غزة", excerpt:"تغطية حديثة ترصد أثر الأزمة على أصحاب المهن واتساع فجوة فرص العمل.", detail:"تسلط التغطية الضوء على واقع سوق العمل في غزة وعلى صعوبة عودة المهنيين إلى مصادر دخل مستقرة. بالنسبة لغزة ووركس، تعكس هذه الصورة الحاجة إلى قنوات عمل تتجاوز السوق المحلي وتسمح للمهارات بالوصول إلى طلب خارجي حقيقي.", source:"الجزيرة", sourceDate:"15 سبتمبر 2026", sourceUrl:links.ajJobs },
    { tag:"عمل عن بُعد", title:"العمل الرقمي ما زال مصدر دخل لآلاف الغزيين رغم أزمات الكهرباء والاتصالات", excerpt:"العمل مع عملاء خارج غزة يستمر رغم القيود التقنية والاقتصادية.", detail:"توثق الجزيرة اعتماد آلاف العاملين على العمل عن بُعد للحفاظ على مصادر دخل مرتبطة بأسواق خارج القطاع. المشكلة ليست نقص المهارة فقط، بل أيضًا الاستمرارية والوصول والاتصال والثقة بين الطرفين.", source:"الجزيرة", sourceDate:"6 أغسطس 2026", sourceUrl:links.ajRemote },
    { tag:"تعافٍ اقتصادي", title:"برنامج IMAR يربط استعادة الدخل بتنشيط الأسواق وفرص العمل", excerpt:"برنامج أممي جديد يركز على سبل العيش والأسواق والتوظيف والتعافي.", detail:"أطلق برنامج الأمم المتحدة الإنمائي وشركاؤه برنامج IMAR بهدف استعادة سبل العيش، ودعم المؤسسات والأسواق، وخلق فرص عمل ضمن إطار تعافٍ اقتصادي فلسطيني القيادة.", source:"UNDP", sourceDate:"15 يونيو 2026", sourceUrl:links.imar },
    { tag:"فرص طارئة", title:"آلاف فرص العمل الطارئة تدعم الأسر والخدمات الأساسية في غزة", excerpt:"UNDP يوثق دور فرص العمل في الصحة والتعليم والقطاع الخاص ضمن مسار التعافي.", detail:"يشرح برنامج الأمم المتحدة الإنمائي كيف ساعدت فرص العمل الطارئة في إبقاء خدمات أساسية قائمة وتوفير دخل مباشر للأسر، مع التركيز على الصحة والتعليم والقطاع الخاص.", source:"UNDP", sourceDate:"4 فبراير 2026", sourceUrl:links.undpJobs },
    { tag:"بيانات العمل", title:"منظمة العمل الدولية ترصد مسار التعافي وسوق العمل الفلسطيني", excerpt:"تحديث جديد يضع مؤشرات سوق العمل والتعافي في سياق اقتصادي أوسع.", detail:"النشرة المشتركة بين منظمة العمل الدولية والجهاز المركزي للإحصاء الفلسطيني تقدم تحديثًا دوريًا لسوق العمل وتناقش متطلبات التعافي في ظل استمرار آثار الأزمة على فرص العمل.", source:"ILO", sourceDate:"14 أغسطس 2026", sourceUrl:links.ilo },
    { tag:"الاقتصاد", title:"البنك الدولي: سوق العمل في غزة ما زال شديد الاضطراب", excerpt:"التقرير الاقتصادي يربط البطالة المرتفعة بضعف النشاط الاقتصادي واستمرار قيود التعافي.", detail:"يشير التحديث الاقتصادي للبنك الدولي إلى أن سوق العمل في غزة ما زال بعيدًا عن العمل بصورة طبيعية، وأن التعافي الاقتصادي يعتمد على الوصول والتمويل وإعادة بناء النشاط الإنتاجي.", source:"البنك الدولي", sourceDate:"19 مايو 2026", sourceUrl:links.wbEconomy },
    { tag:"إعادة الإعمار", title:"تقدير دولي جديد يضع احتياجات التعافي وإعادة الإعمار في نطاق واسع جدًا", excerpt:"تقييم مشترك للبنك الدولي والأمم المتحدة والاتحاد الأوروبي يرسم حجم الاحتياجات الاقتصادية والاجتماعية.", detail:"يقدم تقييم الأضرار والاحتياجات أساسًا فنيًا لفهم أثر الحرب على القطاعات الاقتصادية والاجتماعية، ويؤكد أن استعادة فرص العمل والدخل جزء أساسي من أي مسار تعافٍ متوسط وطويل المدى.", source:"البنك الدولي / الأمم المتحدة / الاتحاد الأوروبي", sourceDate:"أبريل 2026", sourceUrl:links.wbRnda },
  ],
};

const en: EditorialBundle = {
  sourceCta:"Go to source", showMore:"Show 5 more articles", showLess:"Hide extra articles", updatedDaily:"Seven editorial picks · ready for daily refresh", openArticle:"Read summary", closeArticle:"Close summary",
  items:[
    {tag:"Labour market",title:"Job losses continue to pressure skilled professionals in Gaza",excerpt:"Recent reporting tracks the impact of the crisis on professions and access to work.",detail:"The reporting highlights the severe pressure on Gaza's labour market and the difficulty skilled people face in rebuilding stable income. It underlines the need for credible pathways to clients and demand beyond the local market.",source:"Al Jazeera",sourceDate:"15 Sep 2026",sourceUrl:links.ajJobs},
    {tag:"Remote work",title:"Digital work remains an income source for thousands despite power and connectivity crises",excerpt:"Work with clients outside Gaza continues under severe technical constraints.",detail:"Al Jazeera documents how thousands of workers continue remote work for clients outside Gaza. The challenge is not only skill availability, but continuity, connectivity, client access and trust.",source:"Al Jazeera",sourceDate:"6 Aug 2026",sourceUrl:links.ajRemote},
    {tag:"Economic recovery",title:"IMAR links income restoration with market activation and job creation",excerpt:"A UNDP programme focuses on livelihoods, enterprises, markets and employment.",detail:"UNDP and Palestinian partners launched IMAR to support livelihoods, enterprise recovery, market activation, workforce development and employment generation within a Palestinian-led recovery framework.",source:"UNDP",sourceDate:"15 Jun 2026",sourceUrl:links.imar},
    {tag:"Emergency jobs",title:"Emergency employment supports families and essential services in Gaza",excerpt:"UNDP documents employment in health, education and the private sector.",detail:"UNDP describes how emergency employment has supported essential services and household income, with positions across health care, education and the private sector.",source:"UNDP",sourceDate:"4 Feb 2026",sourceUrl:links.undpJobs},
    {tag:"Labour data",title:"ILO tracks labour-market recovery across the Palestinian territory",excerpt:"A new bulletin places labour indicators and recovery needs in a wider economic context.",detail:"The ILO and PCBS labour-market bulletin provides a recurring evidence base on employment conditions and the recovery outlook after the prolonged crisis.",source:"ILO",sourceDate:"14 Aug 2026",sourceUrl:links.ilo},
    {tag:"Economy",title:"World Bank: Gaza's labour market remains deeply distressed",excerpt:"The economic update connects high unemployment with weak activity and a fragile recovery.",detail:"The World Bank economic update describes a largely nonfunctional labour market in Gaza and says recovery depends on access, financing and the restoration of productive activity.",source:"World Bank",sourceDate:"19 May 2026",sourceUrl:links.wbEconomy},
    {tag:"Reconstruction",title:"A new international assessment outlines the scale of Gaza's recovery needs",excerpt:"A joint assessment maps physical, social and economic losses and recovery priorities.",detail:"The World Bank, UN and EU assessment provides a technical basis for recovery planning and reinforces that restoring livelihoods and employment is central to medium- and long-term recovery.",source:"World Bank / UN / EU",sourceDate:"Apr 2026",sourceUrl:links.wbRnda},
  ],
};

function translated(locale: Locale): EditorialBundle {
  if (locale === "ar") return ar;
  if (locale === "en") return en;
  const labels = {
    tr:{sourceCta:"Kaynağa git",showMore:"5 makale daha göster",showLess:"Ek makaleleri gizle",updatedDaily:"Yedi editoryal seçki · günlük güncellemeye hazır",openArticle:"Özeti oku",closeArticle:"Özeti kapat"},
    es:{sourceCta:"Ir a la fuente",showMore:"Mostrar 5 artículos más",showLess:"Ocultar artículos extra",updatedDaily:"Siete selecciones editoriales · listas para actualización diaria",openArticle:"Leer resumen",closeArticle:"Cerrar resumen"},
    fr:{sourceCta:"Voir la source",showMore:"Afficher 5 articles de plus",showLess:"Masquer les articles supplémentaires",updatedDaily:"Sept sélections éditoriales · prêtes pour une mise à jour quotidienne",openArticle:"Lire le résumé",closeArticle:"Fermer le résumé"},
    de:{sourceCta:"Zur Quelle",showMore:"5 weitere Artikel anzeigen",showLess:"Weitere Artikel ausblenden",updatedDaily:"Sieben redaktionelle Beiträge · bereit für tägliche Aktualisierung",openArticle:"Zusammenfassung lesen",closeArticle:"Zusammenfassung schließen"},
  }[locale as "tr"|"es"|"fr"|"de"];

  const localizedTitles: Record<"tr"|"es"|"fr"|"de", Array<[string,string,string]>> = {
    tr:[
      ["İş gücü","Gazze'de iş kaybı nitelikli profesyoneller üzerindeki baskıyı artırıyor","Güncel haberler meslek sahiplerinin iş ve gelir kaynaklarına erişimini inceliyor."],
      ["Uzaktan çalışma","Elektrik ve bağlantı krizlerine rağmen dijital çalışma binlerce kişi için gelir kaynağı","Gazze dışındaki müşterilerle çalışma ağır teknik koşullara rağmen sürüyor."],
      ["Ekonomik toparlanma","IMAR gelirin yeniden kurulmasını piyasa aktivasyonu ve istihdamla bağlıyor","UNDP programı geçim kaynakları, işletmeler, piyasalar ve işe odaklanıyor."],
      ["Acil istihdam","Acil iş fırsatları aileleri ve temel hizmetleri destekliyor","UNDP sağlık, eğitim ve özel sektörde istihdamı belgeliyor."],
      ["İşgücü verileri","ILO Filistin işgücü piyasasının toparlanmasını izliyor","Yeni bülten işgücü göstergelerini daha geniş ekonomik çerçeveye yerleştiriyor."],
      ["Ekonomi","Dünya Bankası: Gazze işgücü piyasası hâlâ ağır baskı altında","Ekonomik güncelleme yüksek işsizliği zayıf faaliyet ve kırılgan toparlanmayla ilişkilendiriyor."],
      ["Yeniden inşa","Yeni uluslararası değerlendirme Gazze'nin toparlanma ihtiyacının ölçeğini gösteriyor","Ortak değerlendirme ekonomik ve sosyal kayıpları ve toparlanma önceliklerini inceliyor."],
    ],
    es:[
      ["Mercado laboral","La pérdida de empleo sigue presionando a los profesionales de Gaza","La cobertura reciente analiza el impacto de la crisis sobre las profesiones y el acceso al trabajo."],
      ["Trabajo remoto","El trabajo digital sigue generando ingresos pese a la crisis eléctrica y de conectividad","La colaboración con clientes fuera de Gaza continúa bajo fuertes restricciones técnicas."],
      ["Recuperación","IMAR conecta la recuperación de ingresos con la activación del mercado y el empleo","El programa del PNUD se centra en medios de vida, empresas, mercados y empleo."],
      ["Empleo de emergencia","El empleo de emergencia apoya a familias y servicios esenciales","El PNUD documenta puestos en salud, educación y sector privado."],
      ["Datos laborales","La OIT sigue la recuperación del mercado laboral palestino","Un nuevo boletín sitúa los indicadores de empleo en un contexto económico más amplio."],
      ["Economía","Banco Mundial: el mercado laboral de Gaza sigue profundamente deteriorado","La actualización económica vincula el alto desempleo con la debilidad de la actividad."],
      ["Reconstrucción","Una nueva evaluación internacional expone la magnitud de las necesidades de recuperación","La evaluación conjunta cartografía pérdidas y prioridades económicas y sociales."],
    ],
    fr:[
      ["Marché du travail","Les pertes d'emploi continuent de peser sur les professionnels de Gaza","Des reportages récents suivent l'impact de la crise sur les métiers et l'accès au travail."],
      ["Travail à distance","Le travail numérique reste une source de revenus malgré les crises d'électricité et de connexion","Le travail avec des clients hors de Gaza se poursuit malgré de fortes contraintes techniques."],
      ["Relance économique","IMAR relie restauration des revenus, activation des marchés et emploi","Le programme du PNUD se concentre sur les moyens de subsistance, les entreprises, les marchés et l'emploi."],
      ["Emploi d'urgence","L'emploi d'urgence soutient les familles et les services essentiels","Le PNUD documente des postes dans la santé, l'éducation et le secteur privé."],
      ["Données du travail","L'OIT suit la reprise du marché du travail palestinien","Un nouveau bulletin replace les indicateurs de l'emploi dans un contexte économique plus large."],
      ["Économie","Banque mondiale : le marché du travail à Gaza reste profondément fragilisé","La mise à jour économique relie le chômage élevé à la faiblesse de l'activité."],
      ["Reconstruction","Une nouvelle évaluation internationale mesure l'ampleur des besoins de relèvement","L'évaluation conjointe cartographie les pertes et les priorités économiques et sociales."],
    ],
    de:[
      ["Arbeitsmarkt","Jobverluste belasten Fachkräfte in Gaza weiterhin stark","Aktuelle Berichte untersuchen die Folgen der Krise für Berufe und Arbeitszugang."],
      ["Remote-Arbeit","Digitale Arbeit bleibt trotz Strom- und Verbindungskrisen eine Einkommensquelle","Arbeit für Kunden außerhalb Gazas geht unter schweren technischen Bedingungen weiter."],
      ["Erholung","IMAR verbindet Einkommensaufbau mit Marktaktivierung und Beschäftigung","Das UNDP-Programm konzentriert sich auf Lebensgrundlagen, Unternehmen, Märkte und Jobs."],
      ["Notbeschäftigung","Notbeschäftigung unterstützt Familien und grundlegende Dienste","UNDP dokumentiert Stellen in Gesundheit, Bildung und Privatsektor."],
      ["Arbeitsmarktdaten","ILO verfolgt die Erholung des palästinensischen Arbeitsmarkts","Ein neues Bulletin ordnet Beschäftigungsindikatoren in einen breiteren wirtschaftlichen Kontext ein."],
      ["Wirtschaft","Weltbank: Gazas Arbeitsmarkt bleibt stark beeinträchtigt","Das Wirtschaftsupdate verbindet hohe Arbeitslosigkeit mit schwacher Aktivität und fragiler Erholung."],
      ["Wiederaufbau","Neue internationale Bewertung zeigt den Umfang des Wiederaufbaubedarfs","Die gemeinsame Bewertung erfasst wirtschaftliche und soziale Verluste sowie Prioritäten."],
    ],
  };

  const details = en.items.map((item, index) => ({
    ...item,
    tag: localizedTitles[locale as "tr"|"es"|"fr"|"de"][index][0],
    title: localizedTitles[locale as "tr"|"es"|"fr"|"de"][index][1],
    excerpt: localizedTitles[locale as "tr"|"es"|"fr"|"de"][index][2],
    detail: localizedTitles[locale as "tr"|"es"|"fr"|"de"][index][2] + " " + item.detail,
  }));

  return {...labels, items:details};
}

export function editorialSources(locale: Locale) {
  return translated(locale);
}
