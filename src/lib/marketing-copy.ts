import type { Locale } from "@/lib/i18n";

type Service = { title: string; body: string };
type EditorialCard = { tag: string; title: string; excerpt: string };
type FooterLink = { label: string; href: string };

type MarketingCopy = {
  workspace: string;
  network: { eyebrow: string; title: string; body: string; chips: string[] };
  services: { eyebrow: string; title: string; body: string; items: Service[] };
  mission: { eyebrow: string; title: string; body: string; points: Service[] };
  editorial: {
    eyebrow: string;
    title: string;
    body: string;
    readAll: string;
    readArticle: string;
    cards: EditorialCard[];
  };
  cta: { eyebrow: string; title: string; body: string; primary: string; secondary: string };
  footer: {
    about: string;
    groups: { title: string; links: FooterLink[] }[];
  };
  blog: { eyebrow: string; title: string; description: string; loading: string; empty: string };
};

const sharedLinks = {
  company: [
    { href: "about", key: "about" },
    { href: "why", key: "why" },
    { href: "contact", key: "contact" },
  ],
  marketplace: [
    { href: "talent", key: "talent" },
    { href: "hire", key: "hire" },
    { href: "join-talent", key: "join" },
  ],
  trust: [
    { href: "verification", key: "verification" },
    { href: "terms", key: "terms" },
    { href: "privacy", key: "privacy" },
  ],
} as const;

const copy: Record<Locale, MarketingCopy> = {
  en: {
    workspace: "Workspace",
    network: {
      eyebrow: "A trusted professional network",
      title: "Gaza talent, ready to work globally.",
      body: "Discover professionals and teams through clear profiles, verified identity, reviewed portfolios, and a structured path from first contact to delivery.",
      chips: ["Identity verified", "Portfolio-led profiles", "Remote-ready collaboration"],
    },
    services: {
      eyebrow: "Designed around confidence",
      title: "Professional work should feel simple.",
      body: "GazaWorks keeps the experience focused: find the right people, understand how they work, agree on scope, and keep every step visible.",
      items: [
        { title: "Human verification", body: "Profiles are reviewed through a real verification process before trust signals are shown." },
        { title: "Clear professional profiles", body: "Skills, experience, languages, availability, services, and work samples are organized for fast decisions." },
        { title: "Structured collaboration", body: "Requests, offers, agreements, messages, files, and delivery stay connected to the same project." },
        { title: "Accountability by design", body: "Project history, reviews, moderation, and dispute records make expectations clearer for both sides." },
      ],
    },
    mission: {
      eyebrow: "Why GazaWorks exists",
      title: "Work can reconnect Gaza with opportunity.",
      body: "Many professionals in Gaza have lost jobs, clients, workplaces, and dependable sources of income. GazaWorks is designed to make their skills visible to clients, companies, organizations, and supporters outside Gaza — through paid work, long-term collaboration, and real professional opportunity.",
      points: [
        { title: "Support through work", body: "The platform centers skills and value: hire a professional, commission a team, or open a real project opportunity." },
        { title: "A bridge beyond borders", body: "Remote work can connect Gaza’s designers, developers, marketers, translators, media professionals, and teams with demand abroad." },
      ],
    },
    editorial: {
      eyebrow: "GazaWorks Journal · selected reporting",
      title: "Work, income, and professional life in Gaza.",
      body: "Selected reporting and practical analysis on livelihoods, lost jobs, rebuilding income, remote work, and access to clients abroad.",
      readAll: "Explore the journal",
      readArticle: "Read in the journal",
      cards: [
        { tag: "Work & income", title: "When a job disappears, professional skill does not.", excerpt: "How displaced careers can be rebuilt around portfolios, remote collaboration, and access to clients beyond the local market." },
        { tag: "Remote opportunity", title: "Why global clients matter to Gaza’s professionals.", excerpt: "A practical look at how cross-border digital work can diversify income and create continuity when local opportunities shrink." },
        { tag: "Professional reality", title: "From surviving day to day to rebuilding a career path.", excerpt: "The difference between short-term assistance and sustainable professional opportunity — and why both can matter at different moments." },
      ],
    },
    cta: {
      eyebrow: "Start with one real opportunity",
      title: "Hire talent. Join as a professional. Build something useful.",
      body: "GazaWorks brings both sides into one clear, modern, accountable experience.",
      primary: "Find talent",
      secondary: "Join GazaWorks",
    },
    footer: {
      about: "A professional platform connecting verified talent in Gaza with meaningful work and collaboration around the world.",
      groups: [
        { title: "Company", links: sharedLinks.company.map((x) => ({ href: x.href, label: ({ about: "About", why: "Why GazaWorks", contact: "Contact" } as const)[x.key] })) },
        { title: "Marketplace", links: sharedLinks.marketplace.map((x) => ({ href: x.href, label: ({ talent: "Find talent", hire: "Hire", join: "Join as talent" } as const)[x.key] })) },
        { title: "Trust", links: sharedLinks.trust.map((x) => ({ href: x.href, label: ({ verification: "Verification", terms: "Terms", privacy: "Privacy" } as const)[x.key] })) },
      ],
    },
    blog: {
      eyebrow: "GazaWorks Journal",
      title: "Stories about work, income, and opportunity.",
      description: "Selected source-linked reporting on professional life in Gaza, remote work, rebuilding income, and global collaboration.",
      loading: "Loading articles…",
      empty: "No articles are published yet. New editorial pieces will appear here.",
    },
  },
  ar: {
    workspace: "مساحة العمل",
    network: {
      eyebrow: "شبكة مهنية مبنية على الثقة",
      title: "مواهب غزة جاهزة للعمل مع العالم.",
      body: "اكتشف محترفين وفرقًا من خلال ملفات واضحة، وهوية موثقة، وأعمال سابقة منظمة، ومسار مفهوم يبدأ من التعارف وينتهي بالتسليم.",
      chips: ["هوية موثقة", "ملفات مبنية على الأعمال", "جاهزية للعمل عن بُعد"],
    },
    services: {
      eyebrow: "تجربة مصممة للثقة",
      title: "العمل الاحترافي يجب أن يكون بسيطًا.",
      body: "تركّز غزة ووركس على ما يهم: إيجاد الشخص المناسب، فهم خبرته، الاتفاق على نطاق العمل، ومتابعة كل خطوة بوضوح.",
      items: [
        { title: "تحقق بشري", body: "تتم مراجعة الملفات عبر مسار تحقق حقيقي قبل إظهار إشارات الثقة على الحساب." },
        { title: "ملفات مهنية واضحة", body: "المهارات والخبرة واللغات والتفرغ والخدمات ونماذج الأعمال مرتبة لتسهيل اتخاذ القرار." },
        { title: "تعاون منظم", body: "طلبات العمل والعروض والاتفاقيات والرسائل والملفات والتسليم تبقى مرتبطة بالمشروع نفسه." },
        { title: "مسؤولية من الطرفين", body: "سجل المشروع والتقييمات والإشراف والنزاعات يجعل التوقعات أوضح للعميل وللمحترف." },
      ],
    },
    mission: {
      eyebrow: "لماذا غزة ووركس؟",
      title: "العمل يمكن أن يعيد وصل غزة بالفرص.",
      body: "فقد كثير من المهنيين في غزة وظائفهم وعملاءهم وأماكن عملهم ومصادر دخل مستقرة. صُممت غزة ووركس لإظهار مهاراتهم أمام العملاء والشركات والمؤسسات والداعمين خارج غزة، من خلال عمل مدفوع وتعاون طويل الأمد وفرص مهنية حقيقية.",
      points: [
        { title: "دعم من خلال العمل", body: "المنصة تضع المهارة والقيمة في المركز: وظّف محترفًا، كلّف فريقًا، أو افتح فرصة مشروع حقيقية." },
        { title: "جسر يتجاوز الحدود", body: "العمل عن بُعد يمكن أن يصل مصممي غزة ومطوريها ومسوقيها ومترجميها وصناع المحتوى وفرقها بالطلب في الخارج." },
      ],
    },
    editorial: {
      eyebrow: "مجلة غزة ووركس · تقارير مختارة",
      title: "العمل والدخل والواقع المهني في غزة.",
      body: "تقارير وتحليلات مختارة عن سبل العيش، وفقدان الوظائف، وإعادة بناء مصادر الدخل، والعمل عن بُعد، وأهمية الوصول إلى عملاء من خارج غزة.",
      readAll: "استكشف المجلة",
      readArticle: "اقرأ في المجلة",
      cards: [
        { tag: "العمل والدخل", title: "قد تختفي الوظيفة، لكن المهارة المهنية لا تختفي.", excerpt: "كيف يمكن إعادة بناء المسار المهني عبر ملف أعمال قوي، والعمل عن بُعد، والوصول إلى عملاء خارج السوق المحلي." },
        { tag: "فرص عن بُعد", title: "لماذا يحتاج محترفو غزة إلى عملاء من خارج غزة؟", excerpt: "نظرة عملية إلى دور العمل الرقمي العابر للحدود في تنويع الدخل وخلق استمرارية عندما تضيق الفرص المحلية." },
        { tag: "الواقع المهني", title: "من تدبير اليوم إلى إعادة بناء مسار مهني.", excerpt: "الفرق بين المساعدة قصيرة الأمد والفرصة المهنية المستدامة، ولماذا قد تكون لكل منهما أهمية في وقت مختلف." },
      ],
    },
    cta: {
      eyebrow: "ابدأ بفرصة حقيقية واحدة",
      title: "وظّف موهبة. انضم كمحترف. وابنِ شيئًا مفيدًا.",
      body: "تجمع غزة ووركس الطرفين في تجربة واحدة واضحة وحديثة ومسؤولة.",
      primary: "اكتشف المواهب",
      secondary: "انضم إلى غزة ووركس",
    },
    footer: {
      about: "منصة مهنية تربط المواهب الموثقة في غزة بفرص عمل وتعاون حقيقية حول العالم.",
      groups: [
        { title: "المنصة", links: [{ href: "about", label: "عن غزة ووركس" }, { href: "why", label: "لماذا غزة ووركس" }, { href: "contact", label: "تواصل معنا" }] },
        { title: "سوق العمل", links: [{ href: "talent", label: "اكتشف المواهب" }, { href: "hire", label: "وظّف محترفًا" }, { href: "join-talent", label: "انضم كمحترف" }] },
        { title: "الثقة", links: [{ href: "verification", label: "التحقق" }, { href: "terms", label: "الشروط" }, { href: "privacy", label: "الخصوصية" }] },
      ],
    },
    blog: {
      eyebrow: "مجلة غزة ووركس",
      title: "قصص عن العمل والدخل والفرص.",
      description: "ملخصات وتقارير مختارة مع روابط مصادرها عن الواقع المهني في غزة والعمل عن بُعد وإعادة بناء مصادر الدخل.",
      loading: "جارٍ تحميل المقالات…",
      empty: "لا توجد مقالات منشورة بعد. ستظهر المواد التحريرية الجديدة هنا.",
    },
  },
  tr: {
    workspace: "Çalışma alanı",
    network: {
      eyebrow: "Güvene dayalı profesyonel ağ",
      title: "Gazze’nin yetenekleri dünyayla çalışmaya hazır.",
      body: "Net profiller, doğrulanmış kimlik, düzenli portföyler ve ilk temastan teslimata kadar anlaşılır bir süreç üzerinden profesyonelleri ve ekipleri keşfedin.",
      chips: ["Kimlik doğrulandı", "Portföy odaklı profiller", "Uzaktan çalışmaya hazır"],
    },
    services: {
      eyebrow: "Güven için tasarlandı",
      title: "Profesyonel çalışma sade hissettirmeli.",
      body: "GazaWorks doğru kişiyi bulmaya, deneyimini anlamaya, kapsamı netleştirmeye ve her adımı görünür tutmaya odaklanır.",
      items: [
        { title: "İnsan tarafından doğrulama", body: "Güven işaretleri gösterilmeden önce profiller gerçek bir doğrulama sürecinden geçer." },
        { title: "Net profesyonel profiller", body: "Beceriler, deneyim, diller, uygunluk, hizmetler ve iş örnekleri hızlı karar vermeyi kolaylaştıracak şekilde düzenlenir." },
        { title: "Yapılandırılmış iş birliği", body: "İş talepleri, teklifler, anlaşmalar, mesajlar, dosyalar ve teslimatlar aynı projede bağlantılı kalır." },
        { title: "Tasarımla gelen hesap verebilirlik", body: "Proje geçmişi, değerlendirmeler, moderasyon ve uyuşmazlık kayıtları iki taraf için beklentileri netleştirir." },
      ],
    },
    mission: {
      eyebrow: "GazaWorks neden var?",
      title: "Çalışma, Gazze’yi yeniden fırsatlarla buluşturabilir.",
      body: "Gazze’de birçok profesyonel işini, müşterilerini, çalışma alanını ve düzenli gelir kaynaklarını kaybetti. GazaWorks, becerileri Gazze dışındaki müşterilere, şirketlere, kuruluşlara ve destekçilere ücretli iş ve uzun vadeli iş birliği yoluyla görünür kılmak için tasarlandı.",
      points: [
        { title: "Çalışma yoluyla destek", body: "Platform beceri ve değeri merkeze alır: bir profesyonel işe alın, bir ekiple çalışın veya gerçek bir proje fırsatı açın." },
        { title: "Sınırların ötesinde bir köprü", body: "Uzaktan çalışma; tasarımcıları, geliştiricileri, pazarlamacıları, çevirmenleri ve medya ekiplerini dış pazardaki taleple buluşturabilir." },
      ],
    },
    editorial: {
      eyebrow: "GazaWorks Journal · seçilmiş haberler",
      title: "Gazze’de çalışma, gelir ve profesyonel yaşam.",
      body: "Geçim kaynakları, iş kaybı, geliri yeniden kurma, uzaktan çalışma ve yurt dışındaki müşterilere erişim üzerine seçilmiş haberler ve analizler.",
      readAll: "Dergiyi keşfet",
      readArticle: "Dergide oku",
      cards: [
        { tag: "İş & gelir", title: "Bir iş kaybolabilir; profesyonel beceri kaybolmaz.", excerpt: "Portföy, uzaktan iş birliği ve yerel pazarın dışındaki müşterilerle kariyer yolunu yeniden kurmak." },
        { tag: "Uzaktan fırsat", title: "Küresel müşteriler Gazze’deki profesyoneller için neden önemli?", excerpt: "Sınır ötesi dijital çalışmanın geliri çeşitlendirmedeki ve devamlılık yaratmadaki rolü." },
        { tag: "Profesyonel gerçeklik", title: "Günü kurtarmaktan kariyer yolunu yeniden kurmaya.", excerpt: "Kısa vadeli yardım ile sürdürülebilir profesyonel fırsat arasındaki fark ve her ikisinin farklı zamanlardaki önemi." },
      ],
    },
    cta: { eyebrow: "Tek bir gerçek fırsatla başlayın", title: "Yetenek bulun. Profesyonel olarak katılın. Faydalı bir şey üretin.", body: "GazaWorks iki tarafı tek, modern ve hesap verebilir deneyimde buluşturur.", primary: "Yetenekleri bul", secondary: "GazaWorks’e katıl" },
    footer: {
      about: "Gazze’deki doğrulanmış yetenekleri dünya çapında anlamlı iş ve iş birlikleriyle buluşturan profesyonel platform.",
      groups: [
        { title: "Şirket", links: [{ href: "about", label: "Hakkımızda" }, { href: "why", label: "Neden GazaWorks" }, { href: "contact", label: "İletişim" }] },
        { title: "Pazar", links: [{ href: "talent", label: "Yetenek bul" }, { href: "hire", label: "İşe al" }, { href: "join-talent", label: "Profesyonel olarak katıl" }] },
        { title: "Güven", links: [{ href: "verification", label: "Doğrulama" }, { href: "terms", label: "Koşullar" }, { href: "privacy", label: "Gizlilik" }] },
      ],
    },
    blog: { eyebrow: "GazaWorks Journal", title: "İş, gelir ve fırsat hikâyeleri.", description: "Gazze’de profesyonel yaşam, uzaktan çalışma ve geliri yeniden kurma üzerine kaynak bağlantılı seçilmiş içerik.", loading: "Makaleler yükleniyor…", empty: "Henüz yayımlanmış makale yok. Yeni editoryal içerikler burada görünecek." },
  },
  es: {
    workspace: "Espacio de trabajo",
    network: {
      eyebrow: "Una red profesional basada en la confianza",
      title: "El talento de Gaza, preparado para trabajar con el mundo.",
      body: "Descubre profesionales y equipos mediante perfiles claros, identidad verificada, portfolios organizados y un proceso comprensible desde el primer contacto hasta la entrega.",
      chips: ["Identidad verificada", "Perfiles centrados en portfolio", "Preparados para trabajo remoto"],
    },
    services: {
      eyebrow: "Diseñado para generar confianza",
      title: "El trabajo profesional debería sentirse simple.",
      body: "GazaWorks se centra en lo esencial: encontrar a la persona adecuada, comprender su experiencia, acordar el alcance y mantener cada paso visible.",
      items: [
        { title: "Verificación humana", body: "Los perfiles pasan por un proceso real de verificación antes de mostrar señales de confianza." },
        { title: "Perfiles profesionales claros", body: "Habilidades, experiencia, idiomas, disponibilidad, servicios y trabajos se organizan para facilitar decisiones rápidas." },
        { title: "Colaboración estructurada", body: "Solicitudes, ofertas, acuerdos, mensajes, archivos y entregas permanecen conectados al mismo proyecto." },
        { title: "Responsabilidad desde el diseño", body: "El historial, las reseñas, la moderación y los registros de disputas aclaran las expectativas para ambas partes." },
      ],
    },
    mission: {
      eyebrow: "Por qué existe GazaWorks",
      title: "El trabajo puede volver a conectar Gaza con las oportunidades.",
      body: "Muchos profesionales de Gaza han perdido empleos, clientes, lugares de trabajo y fuentes estables de ingresos. GazaWorks busca hacer visibles sus capacidades ante clientes, empresas, organizaciones y personas de apoyo fuera de Gaza mediante trabajo remunerado y colaboración profesional real.",
      points: [
        { title: "Apoyo a través del trabajo", body: "La plataforma pone las habilidades y el valor en el centro: contrata a un profesional, encarga un proyecto a un equipo o abre una oportunidad real." },
        { title: "Un puente más allá de las fronteras", body: "El trabajo remoto puede conectar a diseñadores, desarrolladores, especialistas en marketing, traductores y equipos de medios con demanda internacional." },
      ],
    },
    editorial: {
      eyebrow: "GazaWorks Journal · reportajes seleccionados",
      title: "Trabajo, ingresos y vida profesional en Gaza.",
      body: "Reportajes y análisis seleccionados sobre medios de vida, pérdida de empleo, reconstrucción de ingresos, trabajo remoto y clientes fuera de Gaza.",
      readAll: "Explorar la revista",
      readArticle: "Leer en la revista",
      cards: [
        { tag: "Trabajo e ingresos", title: "Un empleo puede desaparecer; la capacidad profesional no.", excerpt: "Cómo reconstruir una trayectoria mediante portfolio, colaboración remota y clientes más allá del mercado local." },
        { tag: "Oportunidad remota", title: "Por qué los clientes globales importan para los profesionales de Gaza.", excerpt: "El papel del trabajo digital transfronterizo para diversificar ingresos y crear continuidad." },
        { tag: "Realidad profesional", title: "De resolver el día a día a reconstruir una carrera.", excerpt: "La diferencia entre ayuda de corto plazo y oportunidad profesional sostenible, y por qué ambas pueden ser importantes." },
      ],
    },
    cta: { eyebrow: "Empieza con una oportunidad real", title: "Contrata talento. Únete como profesional. Construye algo útil.", body: "GazaWorks reúne a ambas partes en una experiencia clara, moderna y responsable.", primary: "Encontrar talento", secondary: "Unirse a GazaWorks" },
    footer: {
      about: "Una plataforma profesional que conecta talento verificado de Gaza con trabajo y colaboración significativos en todo el mundo.",
      groups: [
        { title: "Empresa", links: [{ href: "about", label: "Nosotros" }, { href: "why", label: "Por qué GazaWorks" }, { href: "contact", label: "Contacto" }] },
        { title: "Mercado", links: [{ href: "talent", label: "Encontrar talento" }, { href: "hire", label: "Contratar" }, { href: "join-talent", label: "Unirse como talento" }] },
        { title: "Confianza", links: [{ href: "verification", label: "Verificación" }, { href: "terms", label: "Términos" }, { href: "privacy", label: "Privacidad" }] },
      ],
    },
    blog: { eyebrow: "GazaWorks Journal", title: "Historias sobre trabajo, ingresos y oportunidades.", description: "Publicación pensada para el día a día sobre la vida profesional en Gaza, trabajo remoto, reconstrucción de ingresos y vías prácticas hacia la colaboración global.", loading: "Cargando artículos…", empty: "Aún no hay artículos publicados. El nuevo contenido editorial aparecerá aquí." },
  },
  fr: {
    workspace: "Espace de travail",
    network: {
      eyebrow: "Un réseau professionnel fondé sur la confiance",
      title: "Les talents de Gaza, prêts à travailler avec le monde.",
      body: "Découvrez des professionnels et des équipes grâce à des profils clairs, une identité vérifiée, des portfolios structurés et un parcours lisible du premier contact à la livraison.",
      chips: ["Identité vérifiée", "Profils centrés sur le portfolio", "Prêts pour le travail à distance"],
    },
    services: {
      eyebrow: "Pensé pour la confiance",
      title: "Le travail professionnel devrait rester simple.",
      body: "GazaWorks se concentre sur l’essentiel : trouver la bonne personne, comprendre son expérience, définir la mission et garder chaque étape visible.",
      items: [
        { title: "Vérification humaine", body: "Les profils passent par un véritable processus de vérification avant l’affichage des signaux de confiance." },
        { title: "Profils professionnels clairs", body: "Compétences, expérience, langues, disponibilité, services et réalisations sont organisés pour décider rapidement." },
        { title: "Collaboration structurée", body: "Demandes, offres, accords, messages, fichiers et livraisons restent reliés au même projet." },
        { title: "Responsabilité intégrée", body: "Historique, avis, modération et dossiers de litige rendent les attentes plus claires pour les deux parties." },
      ],
    },
    mission: {
      eyebrow: "Pourquoi GazaWorks existe",
      title: "Le travail peut reconnecter Gaza aux opportunités.",
      body: "De nombreux professionnels à Gaza ont perdu leur emploi, leurs clients, leur lieu de travail et des sources de revenus stables. GazaWorks vise à rendre leurs compétences visibles auprès de clients, entreprises, organisations et soutiens hors de Gaza, par le travail rémunéré et des collaborations professionnelles durables.",
      points: [
        { title: "Soutenir par le travail", body: "La plateforme place les compétences et la valeur au centre : recrutez un professionnel, missionnez une équipe ou ouvrez une vraie opportunité." },
        { title: "Un pont au-delà des frontières", body: "Le travail à distance peut relier designers, développeurs, marketeurs, traducteurs et équipes média de Gaza à la demande internationale." },
      ],
    },
    editorial: {
      eyebrow: "GazaWorks Journal · reportages sélectionnés",
      title: "Travail, revenus et vie professionnelle à Gaza.",
      body: "Une sélection de reportages et d’analyses sur les moyens de subsistance, la perte d’emploi, le travail à distance et l’accès à des clients hors de Gaza.",
      readAll: "Explorer le journal",
      readArticle: "Lire dans le journal",
      cards: [
        { tag: "Travail & revenus", title: "Un emploi peut disparaître, pas la compétence professionnelle.", excerpt: "Comment reconstruire un parcours grâce au portfolio, au travail à distance et à des clients au-delà du marché local." },
        { tag: "Opportunité à distance", title: "Pourquoi les clients internationaux comptent pour les professionnels de Gaza.", excerpt: "Le rôle du travail numérique transfrontalier pour diversifier les revenus et créer de la continuité." },
        { tag: "Réalité professionnelle", title: "Du quotidien à la reconstruction d’un parcours professionnel.", excerpt: "La différence entre aide à court terme et opportunité professionnelle durable, et l’importance possible des deux." },
      ],
    },
    cta: { eyebrow: "Commencez par une vraie opportunité", title: "Recrutez un talent. Rejoignez comme professionnel. Construisez quelque chose d’utile.", body: "GazaWorks réunit les deux côtés dans une expérience claire, moderne et responsable.", primary: "Trouver des talents", secondary: "Rejoindre GazaWorks" },
    footer: {
      about: "Une plateforme professionnelle qui relie les talents vérifiés de Gaza à des missions et collaborations significatives dans le monde.",
      groups: [
        { title: "Entreprise", links: [{ href: "about", label: "À propos" }, { href: "why", label: "Pourquoi GazaWorks" }, { href: "contact", label: "Contact" }] },
        { title: "Marché", links: [{ href: "talent", label: "Trouver des talents" }, { href: "hire", label: "Recruter" }, { href: "join-talent", label: "Rejoindre comme talent" }] },
        { title: "Confiance", links: [{ href: "verification", label: "Vérification" }, { href: "terms", label: "Conditions" }, { href: "privacy", label: "Confidentialité" }] },
      ],
    },
    blog: { eyebrow: "GazaWorks Journal", title: "Histoires de travail, de revenus et d’opportunités.", description: "Des reportages sélectionnés avec leurs sources sur la vie professionnelle à Gaza, le travail à distance et la reconstruction des revenus.", loading: "Chargement des articles…", empty: "Aucun article n’est encore publié. Les nouveaux contenus éditoriaux apparaîtront ici." },
  },
  de: {
    workspace: "Arbeitsbereich",
    network: {
      eyebrow: "Ein professionelles Netzwerk auf Vertrauensbasis",
      title: "Talente aus Gaza – bereit für die Zusammenarbeit mit der Welt.",
      body: "Entdecken Sie Fachkräfte und Teams über klare Profile, verifizierte Identitäten, strukturierte Portfolios und einen nachvollziehbaren Weg vom ersten Kontakt bis zur Lieferung.",
      chips: ["Identität verifiziert", "Portfolio-orientierte Profile", "Bereit für Remote-Arbeit"],
    },
    services: {
      eyebrow: "Für Vertrauen gestaltet",
      title: "Professionelle Zusammenarbeit sollte einfach sein.",
      body: "GazaWorks konzentriert sich auf das Wesentliche: passende Menschen finden, Erfahrung verstehen, Umfang vereinbaren und jeden Schritt sichtbar halten.",
      items: [
        { title: "Menschliche Verifizierung", body: "Profile durchlaufen einen echten Prüfprozess, bevor Vertrauenssignale angezeigt werden." },
        { title: "Klare Berufsprofile", body: "Fähigkeiten, Erfahrung, Sprachen, Verfügbarkeit, Leistungen und Arbeitsproben sind für schnelle Entscheidungen strukturiert." },
        { title: "Strukturierte Zusammenarbeit", body: "Anfragen, Angebote, Vereinbarungen, Nachrichten, Dateien und Lieferungen bleiben mit demselben Projekt verbunden." },
        { title: "Verantwortung von Anfang an", body: "Projektverlauf, Bewertungen, Moderation und Streitfalldokumentation schaffen Klarheit für beide Seiten." },
      ],
    },
    mission: {
      eyebrow: "Warum GazaWorks existiert",
      title: "Arbeit kann Gaza wieder mit Chancen verbinden.",
      body: "Viele Fachkräfte in Gaza haben Jobs, Kunden, Arbeitsorte und verlässliche Einkommensquellen verloren. GazaWorks soll ihre Fähigkeiten für Kunden, Unternehmen, Organisationen und Unterstützer außerhalb Gazas sichtbar machen – durch bezahlte Arbeit und langfristige professionelle Zusammenarbeit.",
      points: [
        { title: "Unterstützung durch Arbeit", body: "Die Plattform stellt Fähigkeiten und Wert in den Mittelpunkt: Fachkräfte beauftragen, mit Teams arbeiten oder echte Projektchancen eröffnen." },
        { title: "Eine Brücke über Grenzen hinweg", body: "Remote-Arbeit kann Designer, Entwickler, Marketingfachleute, Übersetzer und Medienteams aus Gaza mit internationaler Nachfrage verbinden." },
      ],
    },
    editorial: {
      eyebrow: "GazaWorks Journal · ausgewählte Berichte",
      title: "Arbeit, Einkommen und Berufsleben in Gaza.",
      body: "Ausgewählte Berichte und Analysen zu Lebensunterhalt, Arbeitsplatzverlust, Einkommensaufbau, Remote-Arbeit und Kunden außerhalb Gazas.",
      readAll: "Journal entdecken",
      readArticle: "Im Journal lesen",
      cards: [
        { tag: "Arbeit & Einkommen", title: "Ein Arbeitsplatz kann verschwinden – berufliche Fähigkeiten nicht.", excerpt: "Wie sich Karrierewege über Portfolios, Remote-Zusammenarbeit und Kunden außerhalb des lokalen Marktes neu aufbauen lassen." },
        { tag: "Remote-Chancen", title: "Warum internationale Kunden für Fachkräfte in Gaza wichtig sind.", excerpt: "Wie grenzüberschreitende digitale Arbeit Einkommen diversifizieren und Kontinuität schaffen kann." },
        { tag: "Berufliche Realität", title: "Vom täglichen Überleben zum Wiederaufbau eines Berufswegs.", excerpt: "Der Unterschied zwischen kurzfristiger Hilfe und nachhaltiger beruflicher Chance – und warum beides wichtig sein kann." },
      ],
    },
    cta: { eyebrow: "Beginnen Sie mit einer echten Chance", title: "Talente beauftragen. Als Profi beitreten. Etwas Nützliches schaffen.", body: "GazaWorks bringt beide Seiten in einer klaren, modernen und verantwortlichen Erfahrung zusammen.", primary: "Talente finden", secondary: "GazaWorks beitreten" },
    footer: {
      about: "Eine professionelle Plattform, die verifizierte Talente aus Gaza mit sinnvoller Arbeit und Zusammenarbeit weltweit verbindet.",
      groups: [
        { title: "Unternehmen", links: [{ href: "about", label: "Über uns" }, { href: "why", label: "Warum GazaWorks" }, { href: "contact", label: "Kontakt" }] },
        { title: "Marktplatz", links: [{ href: "talent", label: "Talente finden" }, { href: "hire", label: "Beauftragen" }, { href: "join-talent", label: "Als Talent beitreten" }] },
        { title: "Vertrauen", links: [{ href: "verification", label: "Verifizierung" }, { href: "terms", label: "Bedingungen" }, { href: "privacy", label: "Datenschutz" }] },
      ],
    },
    blog: { eyebrow: "GazaWorks Journal", title: "Geschichten über Arbeit, Einkommen und Chancen.", description: "Ausgewählte Berichte mit Quellenlinks über das Berufsleben in Gaza, Remote-Arbeit und den Wiederaufbau von Einkommen.", loading: "Artikel werden geladen…", empty: "Noch keine Artikel veröffentlicht. Neue redaktionelle Beiträge erscheinen hier." },
  },
};

export function marketingCopy(locale: Locale) {
  return copy[locale] ?? copy.en;
}
