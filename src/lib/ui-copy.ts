import type { Locale } from "@/lib/i18n";

type NavKey =
  | "overview"
  | "profile"
  | "portfolio"
  | "verification"
  | "appointments"
  | "offers"
  | "projects"
  | "messages"
  | "payments"
  | "disputes"
  | "reviews"
  | "cv"
  | "notifications"
  | "findTalent"
  | "savedTalent"
  | "workRequests";

type UiCopy = {
  auth: {
    signIn: string;
    createAccount: string;
    welcomeBack: string;
    join: string;
    fullName: string;
    accountType: string;
    selectOne: string;
    individual: string;
    team: string;
    client: string;
    email: string;
    password: string;
    pleaseWait: string;
    createSecure: string;
    continueGoogle: string;
    checkEmail: string;
    authFailed: string;
    chooseAccount: string;
    forgotPassword: string;
  };
  talent: {
    accessBadge: string;
    title: string;
    intro: string;
    searching: string;
    signInRequired: string;
    unavailable: string;
    noMatch: string;
    saved: string;
    clientOnly: string;
    invitePrompt: string;
    invitationSent: string;
    inviteFailed: string;
    profession: string;
    talentType: string;
    both: string;
    individuals: string;
    teams: string;
    skill: string;
    anySkill: string;
    minExperience: string;
    maxRate: string;
    search: string;
    yearsExperience: (years: number) => string;
    priceByOffer: string;
    verified: string;
    profilePrivate: string;
    newTalent: string;
    reviews: (count: number) => string;
    saveTalent: string;
    invite: string;
  };
  assistant: {
    talentTitle: string;
    faqTitle: string;
    talentBody: string;
    faqBody: string;
    request: string;
    working: string;
    ask: string;
    unavailable: string;
    failed: string;
  };
  workspace: {
    menu: string;
    nav: Record<NavKey, string>;
    individualAccount: string;
    teamAccount: string;
    clientAccount: string;
    profileReady: string;
    profileIncomplete: string;
    verification: string;
    status: Record<string, string>;
    professionalWorkspace: string;
    welcome: string;
    welcomeBody: string;
    editProfile: string;
    completeProfile: string;
    projects: string;
    unreadNotifications: string;
    conversations: string;
    workRequests: string;
    portfolio: string;
    open: string;
    accountStatus: string;
    profile: string;
    ready: string;
    incomplete: string;
    accountType: string;
    individual: string;
    team: string;
    client: string;
    recommended: string;
    clientNext: string;
    findTalent: string;
    postWorkRequest: string;
    verifiedNext: string;
    continueVerification: string;
    profileNext: string;
    completeProfessionalProfile: string;
    notApplicable: string;
  };
  pages: {
    talentBadge: string;
    talentTitle: string;
    workRequestTitle: string;
    workRequestBody: string;
    cvBadge: string;
    cvTitle: string;
    cvBody: string;
    teamTitle: string;
    teamBody: string;
  };
};

const copy: Record<Locale, UiCopy> = {
  en: {
    auth: {
      signIn: "Sign in",
      createAccount: "Create account",
      welcomeBack: "Welcome back",
      join: "Join GazaWorks",
      fullName: "Full or professional name",
      accountType: "Permanent account type",
      selectOne: "Select one",
      individual: "Individual professional from Gaza",
      team: "Team / startup / agency from Gaza",
      client: "International client / organization",
      email: "Email",
      password: "Password",
      pleaseWait: "Please wait…",
      createSecure: "Create secure account",
      continueGoogle: "Continue with Google",
      checkEmail: "Check your email to confirm your account.",
      authFailed: "We could not complete authentication. Check your details and try again.",
      chooseAccount: "Choose an account type",
      forgotPassword: "Forgot password?",
    },
    talent: {
      accessBadge: "Sign-in required · verified talent only",
      title: "Find the right professional",
      intro: "Search verified GazaWorks professionals and teams.",
      searching: "Searching…",
      signInRequired: "Sign in to access detailed talent profiles.",
      unavailable: "Search is temporarily unavailable.",
      noMatch: "No verified talent matched these filters.",
      saved: "Saved to favorites.",
      clientOnly: "Only client accounts can save talent.",
      invitePrompt: "Paste the work request ID you want to send privately to this talent",
      invitationSent: "Private invitation sent.",
      inviteFailed: "Invitation failed. Make sure this is your work request and the talent is eligible.",
      profession: "Profession or name",
      talentType: "Talent type",
      both: "Individuals and teams",
      individuals: "Individuals",
      teams: "Teams",
      skill: "Skill",
      anySkill: "Any skill",
      minExperience: "Minimum experience",
      maxRate: "Maximum rate",
      search: "Search",
      yearsExperience: (years) => `${years} years experience · `,
      priceByOffer: "Price by offer",
      verified: "Verified",
      profilePrivate: "Profile details are available after a direct invitation.",
      newTalent: "New",
      reviews: (count) => `${count} reviews`,
      saveTalent: "Save talent",
      invite: "Invite to work request",
    },
    assistant: {
      talentTitle: "Find the right Gaza talent",
      faqTitle: "Platform assistant",
      talentBody: "Describe the skills and type of professional or team you need. Recommendations use verified GazaWorks records.",
      faqBody: "Ask how GazaWorks works, how to improve a profile, or how to use a platform feature.",
      request: "Your request",
      working: "Working…",
      ask: "Ask GazaWorks AI",
      unavailable: "AI assistance is not connected yet.",
      failed: "We could not answer this request.",
    },
    workspace: {
      menu: "Workspace menu",
      nav: { overview:"Overview", profile:"Profile", portfolio:"Portfolio", verification:"Verification", appointments:"Appointments", offers:"Offers", projects:"Projects", messages:"Messages", payments:"Payments", disputes:"Disputes", reviews:"Reviews", cv:"AI CV Builder", notifications:"Notifications", findTalent:"Find talent", savedTalent:"Saved talent", workRequests:"Work requests" },
      individualAccount: "Individual account",
      teamAccount: "Team account",
      clientAccount: "Client account",
      profileReady: "Profile ready",
      profileIncomplete: "Profile setup incomplete",
      verification: "Verification",
      status: { draft:"Draft", requested:"Requested", under_review:"Under review", interview_required:"Interview required", interview_scheduled:"Interview scheduled", pending:"Pending", verified:"Verified", changes_requested:"Changes requested", rejected:"Rejected", suspended:"Suspended", banned:"Banned" },
      professionalWorkspace: "Professional workspace",
      welcome: "Welcome",
      welcomeBody: "This is your GazaWorks workspace. Keep your profile current and continue through the workflow that matches your account.",
      editProfile: "Edit profile",
      completeProfile: "Complete profile",
      projects: "Projects",
      unreadNotifications: "Unread notifications",
      conversations: "Conversations",
      workRequests: "Work requests",
      portfolio: "Portfolio",
      open: "Open →",
      accountStatus: "Account status",
      profile: "Profile",
      ready: "Ready",
      incomplete: "Incomplete",
      accountType: "Account type",
      individual: "Individual",
      team: "Team",
      client: "Client",
      recommended: "Recommended next step",
      clientNext: "Complete your client profile, discover verified talent, or publish a work request.",
      findTalent: "Find talent",
      postWorkRequest: "Post work request",
      verifiedNext: "Your core profile is ready. Continue to professional verification and book an in-person appointment when a slot is available.",
      continueVerification: "Continue to verification",
      profileNext: "Add your professional title, biography, Gaza location, availability, skills, experience, and pricing before requesting verification.",
      completeProfessionalProfile: "Complete professional profile",
      notApplicable: "Not applicable",
    },
    pages: {
      talentBadge: "Sign-in required · verified talent only",
      talentTitle: "Find the right professional",
      workRequestTitle: "Create a work request",
      workRequestBody: "Describe a real engagement for verified GazaWorks talent.",
      cvBadge: "AI-assisted · you stay in control",
      cvTitle: "CV Builder",
      cvBody: "Build a professional CV, improve the wording with AI, then print or save it as PDF.",
      teamTitle: "Team profile",
      teamBody: "Import a team PDF or DOCX to create a draft, then control how every member appears to authenticated clients.",
    },
  },
  ar: {
    auth: {
      signIn:"تسجيل الدخول", createAccount:"إنشاء حساب", welcomeBack:"مرحبًا بعودتك", join:"انضم إلى غزة ووركس", fullName:"الاسم الكامل أو المهني", accountType:"نوع الحساب الدائم", selectOne:"اختر نوع الحساب", individual:"محترف فردي من غزة", team:"فريق / شركة ناشئة / وكالة من غزة", client:"عميل أو مؤسسة من خارج غزة", email:"البريد الإلكتروني", password:"كلمة المرور", pleaseWait:"يرجى الانتظار…", createSecure:"إنشاء حساب آمن", continueGoogle:"المتابعة باستخدام Google", checkEmail:"تحقق من بريدك الإلكتروني لتأكيد الحساب.", authFailed:"تعذر إكمال تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى.", chooseAccount:"اختر نوع الحساب", forgotPassword:"نسيت كلمة المرور؟"
    },
    talent: {
      accessBadge:"يتطلب تسجيل الدخول · مواهب موثقة فقط", title:"اعثر على المحترف المناسب", intro:"ابحث بين محترفي وفرق غزة ووركس الموثقة.", searching:"جارٍ البحث…", signInRequired:"سجّل الدخول للوصول إلى تفاصيل ملفات المواهب.", unavailable:"البحث غير متاح مؤقتًا.", noMatch:"لم نجد مواهب موثقة تطابق هذه الفلاتر.", saved:"تمت الإضافة إلى المفضلة.", clientOnly:"يمكن لحسابات العملاء فقط حفظ المواهب.", invitePrompt:"ألصق رقم طلب العمل الذي تريد إرساله بشكل خاص لهذه الموهبة", invitationSent:"تم إرسال الدعوة الخاصة.", inviteFailed:"تعذر إرسال الدعوة. تأكد أن طلب العمل يخصك وأن الموهبة مؤهلة.", profession:"المهنة أو الاسم", talentType:"نوع الموهبة", both:"أفراد وفرق", individuals:"أفراد", teams:"فرق", skill:"المهارة", anySkill:"أي مهارة", minExperience:"الحد الأدنى للخبرة", maxRate:"الحد الأعلى للسعر", search:"بحث", yearsExperience:(years)=>`${years} سنوات خبرة · `, priceByOffer:"السعر حسب العرض", verified:"موثّق", profilePrivate:"تفاصيل الملف متاحة بعد دعوة مباشرة.", newTalent:"جديد", reviews:(count)=>`${count} تقييمات`, saveTalent:"حفظ الموهبة", invite:"دعوة إلى طلب عمل"
    },
    assistant: {
      talentTitle:"اعثر على موهبة غزة المناسبة", faqTitle:"مساعد المنصة", talentBody:"صف المهارات ونوع المحترف أو الفريق الذي تحتاجه. تعتمد التوصيات على سجلات غزة ووركس الموثقة.", faqBody:"اسأل عن طريقة عمل غزة ووركس، أو تحسين ملفك، أو استخدام أي ميزة في المنصة.", request:"طلبك", working:"جارٍ العمل…", ask:"اسأل مساعد غزة ووركس", unavailable:"ميزة المساعدة بالذكاء الاصطناعي غير متصلة بعد.", failed:"تعذر الإجابة عن هذا الطلب."
    },
    workspace: {
      menu:"قائمة مساحة العمل",
      nav:{ overview:"نظرة عامة", profile:"الملف الشخصي", portfolio:"معرض الأعمال", verification:"التحقق", appointments:"المواعيد", offers:"العروض", projects:"المشاريع", messages:"الرسائل", payments:"المدفوعات", disputes:"النزاعات", reviews:"التقييمات", cv:"منشئ السيرة الذاتية بالذكاء الاصطناعي", notifications:"الإشعارات", findTalent:"البحث عن المواهب", savedTalent:"المواهب المحفوظة", workRequests:"طلبات العمل" },
      individualAccount:"حساب فردي", teamAccount:"حساب فريق", clientAccount:"حساب عميل", profileReady:"الملف مكتمل", profileIncomplete:"إعداد الملف غير مكتمل", verification:"التحقق",
      status:{ draft:"مسودة", requested:"تم الطلب", under_review:"قيد المراجعة", interview_required:"مقابلة مطلوبة", interview_scheduled:"تم تحديد المقابلة", pending:"قيد الانتظار", verified:"موثّق", changes_requested:"تعديلات مطلوبة", rejected:"مرفوض", suspended:"موقوف", banned:"محظور" },
      professionalWorkspace:"مساحة عمل احترافية", welcome:"مرحبًا", welcomeBody:"هذه مساحة عملك في غزة ووركس. حافظ على تحديث ملفك وتابع المسار المناسب لنوع حسابك.", editProfile:"تعديل الملف", completeProfile:"إكمال الملف", projects:"المشاريع", unreadNotifications:"الإشعارات غير المقروءة", conversations:"المحادثات", workRequests:"طلبات العمل", portfolio:"معرض الأعمال", open:"فتح ←", accountStatus:"حالة الحساب", profile:"الملف", ready:"مكتمل", incomplete:"غير مكتمل", accountType:"نوع الحساب", individual:"فردي", team:"فريق", client:"عميل", recommended:"الخطوة التالية المقترحة", clientNext:"أكمل ملف العميل، وابحث عن المواهب الموثقة، أو انشر طلب عمل.", findTalent:"البحث عن المواهب", postWorkRequest:"نشر طلب عمل", verifiedNext:"ملفك الأساسي جاهز. انتقل إلى التحقق المهني واحجز مقابلة حضورية عند توفر موعد.", continueVerification:"متابعة التحقق", profileNext:"أضف المسمى المهني والنبذة والموقع داخل غزة والتفرغ والمهارات والخبرة والتسعير قبل طلب التحقق.", completeProfessionalProfile:"إكمال الملف المهني", notApplicable:"لا ينطبق"
    },
    pages:{ talentBadge:"يتطلب تسجيل الدخول · مواهب موثقة فقط", talentTitle:"اعثر على المحترف المناسب", workRequestTitle:"أنشئ طلب عمل", workRequestBody:"صف مشروعًا أو مهمة حقيقية لمواهب غزة ووركس الموثقة.", cvBadge:"بمساعدة الذكاء الاصطناعي · القرار بيدك", cvTitle:"منشئ السيرة الذاتية", cvBody:"أنشئ سيرة ذاتية احترافية، حسّن صياغتها بالذكاء الاصطناعي، ثم اطبعها أو احفظها PDF.", teamTitle:"ملف الفريق", teamBody:"استورد ملف PDF أو DOCX للفريق لإنشاء مسودة، ثم تحكم في طريقة ظهور كل عضو للعملاء المسجلين." }
  },
  tr: {
    auth:{ signIn:"Giriş yap", createAccount:"Hesap oluştur", welcomeBack:"Tekrar hoş geldiniz", join:"GazaWorks’e katılın", fullName:"Tam veya profesyonel ad", accountType:"Kalıcı hesap türü", selectOne:"Birini seçin", individual:"Gazze’den bireysel profesyonel", team:"Gazze’den ekip / girişim / ajans", client:"Uluslararası müşteri / kuruluş", email:"E-posta", password:"Şifre", pleaseWait:"Lütfen bekleyin…", createSecure:"Güvenli hesap oluştur", continueGoogle:"Google ile devam et", checkEmail:"Hesabınızı doğrulamak için e-postanızı kontrol edin.", authFailed:"Kimlik doğrulama tamamlanamadı. Bilgilerinizi kontrol edip tekrar deneyin.", chooseAccount:"Bir hesap türü seçin", forgotPassword:"Şifrenizi mi unuttunuz?" },
    talent:{ accessBadge:"Giriş gerekli · yalnızca doğrulanmış yetenekler", title:"Doğru profesyoneli bulun", intro:"Doğrulanmış GazaWorks profesyonellerini ve ekiplerini arayın.", searching:"Aranıyor…", signInRequired:"Ayrıntılı yetenek profillerine erişmek için giriş yapın.", unavailable:"Arama geçici olarak kullanılamıyor.", noMatch:"Bu filtrelere uyan doğrulanmış yetenek bulunamadı.", saved:"Favorilere kaydedildi.", clientOnly:"Yalnızca müşteri hesapları yetenek kaydedebilir.", invitePrompt:"Bu yeteneğe özel olarak göndermek istediğiniz iş talebi kimliğini yapıştırın", invitationSent:"Özel davet gönderildi.", inviteFailed:"Davet gönderilemedi. İş talebinin size ait ve yeteneğin uygun olduğundan emin olun.", profession:"Meslek veya ad", talentType:"Yetenek türü", both:"Bireyler ve ekipler", individuals:"Bireyler", teams:"Ekipler", skill:"Beceri", anySkill:"Herhangi bir beceri", minExperience:"Minimum deneyim", maxRate:"Maksimum ücret", search:"Ara", yearsExperience:(years)=>`${years} yıl deneyim · `, priceByOffer:"Teklife göre fiyat", verified:"Doğrulandı", profilePrivate:"Profil ayrıntıları doğrudan davetten sonra kullanılabilir.", newTalent:"Yeni", reviews:(count)=>`${count} değerlendirme`, saveTalent:"Yeteneği kaydet", invite:"İş talebine davet et" },
    assistant:{ talentTitle:"Doğru Gazze yeteneğini bulun", faqTitle:"Platform asistanı", talentBody:"İhtiyacınız olan becerileri ve profesyonel ya da ekip türünü açıklayın. Öneriler doğrulanmış GazaWorks kayıtlarına dayanır.", faqBody:"GazaWorks’ün nasıl çalıştığını, profilinizi nasıl geliştireceğinizi veya bir özelliği nasıl kullanacağınızı sorun.", request:"Talebiniz", working:"Çalışıyor…", ask:"GazaWorks AI’a sor", unavailable:"AI desteği henüz bağlı değil.", failed:"Bu talep yanıtlanamadı." },
    workspace:{ menu:"Çalışma alanı menüsü", nav:{ overview:"Genel bakış", profile:"Profil", portfolio:"Portföy", verification:"Doğrulama", appointments:"Randevular", offers:"Teklifler", projects:"Projeler", messages:"Mesajlar", payments:"Ödemeler", disputes:"Uyuşmazlıklar", reviews:"Değerlendirmeler", cv:"AI CV Oluşturucu", notifications:"Bildirimler", findTalent:"Yetenek bul", savedTalent:"Kaydedilen yetenekler", workRequests:"İş talepleri" }, individualAccount:"Bireysel hesap", teamAccount:"Ekip hesabı", clientAccount:"Müşteri hesabı", profileReady:"Profil hazır", profileIncomplete:"Profil kurulumu eksik", verification:"Doğrulama", status:{ draft:"Taslak", requested:"Talep edildi", under_review:"İnceleniyor", interview_required:"Görüşme gerekli", interview_scheduled:"Görüşme planlandı", pending:"Beklemede", verified:"Doğrulandı", changes_requested:"Değişiklik istendi", rejected:"Reddedildi", suspended:"Askıya alındı", banned:"Engellendi" }, professionalWorkspace:"Profesyonel çalışma alanı", welcome:"Hoş geldiniz", welcomeBody:"Burası GazaWorks çalışma alanınız. Profilinizi güncel tutun ve hesap türünüze uygun iş akışında ilerleyin.", editProfile:"Profili düzenle", completeProfile:"Profili tamamla", projects:"Projeler", unreadNotifications:"Okunmamış bildirimler", conversations:"Konuşmalar", workRequests:"İş talepleri", portfolio:"Portföy", open:"Aç →", accountStatus:"Hesap durumu", profile:"Profil", ready:"Hazır", incomplete:"Eksik", accountType:"Hesap türü", individual:"Bireysel", team:"Ekip", client:"Müşteri", recommended:"Önerilen sonraki adım", clientNext:"Müşteri profilinizi tamamlayın, doğrulanmış yetenekleri keşfedin veya bir iş talebi yayınlayın.", findTalent:"Yetenek bul", postWorkRequest:"İş talebi yayınla", verifiedNext:"Temel profiliniz hazır. Profesyonel doğrulamaya geçin ve uygun olduğunda yüz yüze görüşme randevusu alın.", continueVerification:"Doğrulamaya devam et", profileNext:"Doğrulama istemeden önce profesyonel unvanınızı, biyografinizi, Gazze konumunuzu, uygunluğunuzu, becerilerinizi, deneyiminizi ve ücretinizi ekleyin.", completeProfessionalProfile:"Profesyonel profili tamamla", notApplicable:"Uygulanamaz" },
    pages:{ talentBadge:"Giriş gerekli · yalnızca doğrulanmış yetenekler", talentTitle:"Doğru profesyoneli bulun", workRequestTitle:"İş talebi oluştur", workRequestBody:"Doğrulanmış GazaWorks yetenekleri için gerçek bir iş veya proje tanımlayın.", cvBadge:"AI destekli · kontrol sizde", cvTitle:"CV Oluşturucu", cvBody:"Profesyonel bir CV oluşturun, metni AI ile geliştirin, ardından yazdırın veya PDF olarak kaydedin.", teamTitle:"Ekip profili", teamBody:"Taslak oluşturmak için ekip PDF veya DOCX dosyasını içe aktarın; ardından her üyenin kayıtlı müşterilere nasıl görüneceğini kontrol edin." }
  },
  es: {
    auth:{ signIn:"Iniciar sesión", createAccount:"Crear cuenta", welcomeBack:"Qué bueno verte de nuevo", join:"Únete a GazaWorks", fullName:"Nombre completo o profesional", accountType:"Tipo de cuenta permanente", selectOne:"Selecciona una opción", individual:"Profesional individual de Gaza", team:"Equipo / startup / agencia de Gaza", client:"Cliente u organización internacional", email:"Correo electrónico", password:"Contraseña", pleaseWait:"Espera un momento…", createSecure:"Crear cuenta segura", continueGoogle:"Continuar con Google", checkEmail:"Revisa tu correo para confirmar la cuenta.", authFailed:"No pudimos completar la autenticación. Revisa tus datos e inténtalo de nuevo.", chooseAccount:"Elige un tipo de cuenta", forgotPassword:"¿Olvidaste tu contraseña?" },
    talent:{ accessBadge:"Inicio de sesión requerido · solo talento verificado", title:"Encuentra al profesional adecuado", intro:"Busca profesionales y equipos verificados de GazaWorks.", searching:"Buscando…", signInRequired:"Inicia sesión para acceder a perfiles detallados.", unavailable:"La búsqueda no está disponible temporalmente.", noMatch:"Ningún talento verificado coincide con estos filtros.", saved:"Guardado en favoritos.", clientOnly:"Solo las cuentas de cliente pueden guardar talento.", invitePrompt:"Pega el ID de la solicitud de trabajo que deseas enviar en privado a este talento", invitationSent:"Invitación privada enviada.", inviteFailed:"No se pudo enviar la invitación. Verifica que la solicitud sea tuya y que el talento sea elegible.", profession:"Profesión o nombre", talentType:"Tipo de talento", both:"Personas y equipos", individuals:"Personas", teams:"Equipos", skill:"Habilidad", anySkill:"Cualquier habilidad", minExperience:"Experiencia mínima", maxRate:"Tarifa máxima", search:"Buscar", yearsExperience:(years)=>`${years} años de experiencia · `, priceByOffer:"Precio según oferta", verified:"Verificado", profilePrivate:"Los detalles del perfil están disponibles tras una invitación directa.", newTalent:"Nuevo", reviews:(count)=>`${count} reseñas`, saveTalent:"Guardar talento", invite:"Invitar a solicitud" },
    assistant:{ talentTitle:"Encuentra el talento de Gaza adecuado", faqTitle:"Asistente de la plataforma", talentBody:"Describe las habilidades y el tipo de profesional o equipo que necesitas. Las recomendaciones usan registros verificados de GazaWorks.", faqBody:"Pregunta cómo funciona GazaWorks, cómo mejorar un perfil o cómo usar una función de la plataforma.", request:"Tu solicitud", working:"Procesando…", ask:"Preguntar a GazaWorks AI", unavailable:"La asistencia con IA aún no está conectada.", failed:"No pudimos responder esta solicitud." },
    workspace:{ menu:"Menú del espacio de trabajo", nav:{ overview:"Resumen", profile:"Perfil", portfolio:"Portafolio", verification:"Verificación", appointments:"Citas", offers:"Ofertas", projects:"Proyectos", messages:"Mensajes", payments:"Pagos", disputes:"Disputas", reviews:"Reseñas", cv:"Creador de CV con IA", notifications:"Notificaciones", findTalent:"Buscar talento", savedTalent:"Talento guardado", workRequests:"Solicitudes de trabajo" }, individualAccount:"Cuenta individual", teamAccount:"Cuenta de equipo", clientAccount:"Cuenta de cliente", profileReady:"Perfil listo", profileIncomplete:"Configuración del perfil incompleta", verification:"Verificación", status:{ draft:"Borrador", requested:"Solicitado", under_review:"En revisión", interview_required:"Entrevista requerida", interview_scheduled:"Entrevista programada", pending:"Pendiente", verified:"Verificado", changes_requested:"Cambios solicitados", rejected:"Rechazado", suspended:"Suspendido", banned:"Bloqueado" }, professionalWorkspace:"Espacio de trabajo profesional", welcome:"Bienvenido", welcomeBody:"Este es tu espacio de trabajo en GazaWorks. Mantén tu perfil actualizado y sigue el flujo adecuado para tu tipo de cuenta.", editProfile:"Editar perfil", completeProfile:"Completar perfil", projects:"Proyectos", unreadNotifications:"Notificaciones sin leer", conversations:"Conversaciones", workRequests:"Solicitudes de trabajo", portfolio:"Portafolio", open:"Abrir →", accountStatus:"Estado de la cuenta", profile:"Perfil", ready:"Listo", incomplete:"Incompleto", accountType:"Tipo de cuenta", individual:"Individual", team:"Equipo", client:"Cliente", recommended:"Siguiente paso recomendado", clientNext:"Completa tu perfil de cliente, descubre talento verificado o publica una solicitud de trabajo.", findTalent:"Buscar talento", postWorkRequest:"Publicar solicitud", verifiedNext:"Tu perfil básico está listo. Continúa con la verificación profesional y reserva una entrevista presencial cuando haya disponibilidad.", continueVerification:"Continuar a verificación", profileNext:"Añade título profesional, biografía, ubicación en Gaza, disponibilidad, habilidades, experiencia y precios antes de solicitar verificación.", completeProfessionalProfile:"Completar perfil profesional", notApplicable:"No aplica" },
    pages:{ talentBadge:"Inicio de sesión requerido · solo talento verificado", talentTitle:"Encuentra al profesional adecuado", workRequestTitle:"Crear una solicitud de trabajo", workRequestBody:"Describe un proyecto o encargo real para talento verificado de GazaWorks.", cvBadge:"Asistido por IA · tú mantienes el control", cvTitle:"Creador de CV", cvBody:"Crea un CV profesional, mejora la redacción con IA y luego imprímelo o guárdalo como PDF.", teamTitle:"Perfil del equipo", teamBody:"Importa un PDF o DOCX del equipo para crear un borrador y controla cómo aparece cada miembro ante clientes autenticados." }
  },
  fr: {
    auth:{ signIn:"Se connecter", createAccount:"Créer un compte", welcomeBack:"Bon retour", join:"Rejoindre GazaWorks", fullName:"Nom complet ou professionnel", accountType:"Type de compte permanent", selectOne:"Choisissez une option", individual:"Professionnel individuel de Gaza", team:"Équipe / startup / agence de Gaza", client:"Client ou organisation internationale", email:"E-mail", password:"Mot de passe", pleaseWait:"Veuillez patienter…", createSecure:"Créer un compte sécurisé", continueGoogle:"Continuer avec Google", checkEmail:"Consultez votre e-mail pour confirmer votre compte.", authFailed:"L’authentification n’a pas pu être terminée. Vérifiez vos informations et réessayez.", chooseAccount:"Choisissez un type de compte", forgotPassword:"Mot de passe oublié ?" },
    talent:{ accessBadge:"Connexion requise · talents vérifiés uniquement", title:"Trouvez le bon professionnel", intro:"Recherchez des professionnels et équipes vérifiés sur GazaWorks.", searching:"Recherche…", signInRequired:"Connectez-vous pour accéder aux profils détaillés.", unavailable:"La recherche est temporairement indisponible.", noMatch:"Aucun talent vérifié ne correspond à ces filtres.", saved:"Ajouté aux favoris.", clientOnly:"Seuls les comptes clients peuvent enregistrer des talents.", invitePrompt:"Collez l’identifiant de la demande de travail à envoyer en privé à ce talent", invitationSent:"Invitation privée envoyée.", inviteFailed:"L’invitation a échoué. Vérifiez que la demande vous appartient et que le talent est éligible.", profession:"Profession ou nom", talentType:"Type de talent", both:"Individus et équipes", individuals:"Individus", teams:"Équipes", skill:"Compétence", anySkill:"Toute compétence", minExperience:"Expérience minimale", maxRate:"Tarif maximal", search:"Rechercher", yearsExperience:(years)=>`${years} ans d’expérience · `, priceByOffer:"Prix sur offre", verified:"Vérifié", profilePrivate:"Les détails du profil sont disponibles après une invitation directe.", newTalent:"Nouveau", reviews:(count)=>`${count} avis`, saveTalent:"Enregistrer le talent", invite:"Inviter à une demande" },
    assistant:{ talentTitle:"Trouvez le bon talent à Gaza", faqTitle:"Assistant de la plateforme", talentBody:"Décrivez les compétences et le type de professionnel ou d’équipe recherchés. Les recommandations reposent sur les profils vérifiés de GazaWorks.", faqBody:"Demandez comment fonctionne GazaWorks, comment améliorer un profil ou utiliser une fonctionnalité.", request:"Votre demande", working:"Traitement…", ask:"Demander à GazaWorks AI", unavailable:"L’assistance IA n’est pas encore connectée.", failed:"Impossible de répondre à cette demande." },
    workspace:{ menu:"Menu de l’espace de travail", nav:{ overview:"Vue d’ensemble", profile:"Profil", portfolio:"Portfolio", verification:"Vérification", appointments:"Rendez-vous", offers:"Offres", projects:"Projets", messages:"Messages", payments:"Paiements", disputes:"Litiges", reviews:"Avis", cv:"Créateur de CV IA", notifications:"Notifications", findTalent:"Trouver des talents", savedTalent:"Talents enregistrés", workRequests:"Demandes de travail" }, individualAccount:"Compte individuel", teamAccount:"Compte équipe", clientAccount:"Compte client", profileReady:"Profil prêt", profileIncomplete:"Configuration du profil incomplète", verification:"Vérification", status:{ draft:"Brouillon", requested:"Demandé", under_review:"En cours d’examen", interview_required:"Entretien requis", interview_scheduled:"Entretien planifié", pending:"En attente", verified:"Vérifié", changes_requested:"Modifications demandées", rejected:"Rejeté", suspended:"Suspendu", banned:"Bloqué" }, professionalWorkspace:"Espace de travail professionnel", welcome:"Bienvenue", welcomeBody:"Voici votre espace de travail GazaWorks. Gardez votre profil à jour et suivez le parcours correspondant à votre compte.", editProfile:"Modifier le profil", completeProfile:"Compléter le profil", projects:"Projets", unreadNotifications:"Notifications non lues", conversations:"Conversations", workRequests:"Demandes de travail", portfolio:"Portfolio", open:"Ouvrir →", accountStatus:"État du compte", profile:"Profil", ready:"Prêt", incomplete:"Incomplet", accountType:"Type de compte", individual:"Individuel", team:"Équipe", client:"Client", recommended:"Étape suivante recommandée", clientNext:"Complétez votre profil client, découvrez des talents vérifiés ou publiez une demande de travail.", findTalent:"Trouver des talents", postWorkRequest:"Publier une demande", verifiedNext:"Votre profil de base est prêt. Passez à la vérification professionnelle et réservez un entretien en personne lorsqu’un créneau est disponible.", continueVerification:"Continuer vers la vérification", profileNext:"Ajoutez votre titre, biographie, localisation à Gaza, disponibilité, compétences, expérience et tarifs avant de demander la vérification.", completeProfessionalProfile:"Compléter le profil professionnel", notApplicable:"Sans objet" },
    pages:{ talentBadge:"Connexion requise · talents vérifiés uniquement", talentTitle:"Trouvez le bon professionnel", workRequestTitle:"Créer une demande de travail", workRequestBody:"Décrivez une mission ou un projet réel pour les talents vérifiés de GazaWorks.", cvBadge:"Assisté par IA · vous gardez le contrôle", cvTitle:"Créateur de CV", cvBody:"Créez un CV professionnel, améliorez la formulation avec l’IA, puis imprimez-le ou enregistrez-le en PDF.", teamTitle:"Profil de l’équipe", teamBody:"Importez un PDF ou DOCX de l’équipe pour créer un brouillon, puis contrôlez l’affichage de chaque membre auprès des clients connectés." }
  },
  de: {
    auth:{ signIn:"Anmelden", createAccount:"Konto erstellen", welcomeBack:"Willkommen zurück", join:"GazaWorks beitreten", fullName:"Vollständiger oder beruflicher Name", accountType:"Dauerhafter Kontotyp", selectOne:"Bitte auswählen", individual:"Einzelne Fachkraft aus Gaza", team:"Team / Startup / Agentur aus Gaza", client:"Internationaler Kunde / Organisation", email:"E-Mail", password:"Passwort", pleaseWait:"Bitte warten…", createSecure:"Sicheres Konto erstellen", continueGoogle:"Mit Google fortfahren", checkEmail:"Prüfen Sie Ihre E-Mail, um das Konto zu bestätigen.", authFailed:"Die Anmeldung konnte nicht abgeschlossen werden. Prüfen Sie Ihre Angaben und versuchen Sie es erneut.", chooseAccount:"Wählen Sie einen Kontotyp", forgotPassword:"Passwort vergessen?" },
    talent:{ accessBadge:"Anmeldung erforderlich · nur verifizierte Talente", title:"Die passende Fachkraft finden", intro:"Durchsuchen Sie verifizierte Fachkräfte und Teams auf GazaWorks.", searching:"Suche läuft…", signInRequired:"Melden Sie sich an, um detaillierte Talentprofile zu sehen.", unavailable:"Die Suche ist vorübergehend nicht verfügbar.", noMatch:"Keine verifizierten Talente entsprechen diesen Filtern.", saved:"Zu Favoriten hinzugefügt.", clientOnly:"Nur Kundenkonten können Talente speichern.", invitePrompt:"Fügen Sie die ID der Arbeitsanfrage ein, die Sie diesem Talent privat senden möchten", invitationSent:"Private Einladung gesendet.", inviteFailed:"Einladung fehlgeschlagen. Prüfen Sie, ob die Arbeitsanfrage Ihnen gehört und das Talent berechtigt ist.", profession:"Beruf oder Name", talentType:"Talenttyp", both:"Einzelpersonen und Teams", individuals:"Einzelpersonen", teams:"Teams", skill:"Fähigkeit", anySkill:"Beliebige Fähigkeit", minExperience:"Mindesterfahrung", maxRate:"Maximaler Preis", search:"Suchen", yearsExperience:(years)=>`${years} Jahre Erfahrung · `, priceByOffer:"Preis nach Angebot", verified:"Verifiziert", profilePrivate:"Profildetails sind nach einer direkten Einladung verfügbar.", newTalent:"Neu", reviews:(count)=>`${count} Bewertungen`, saveTalent:"Talent speichern", invite:"Zur Arbeitsanfrage einladen" },
    assistant:{ talentTitle:"Passende Talente aus Gaza finden", faqTitle:"Plattform-Assistent", talentBody:"Beschreiben Sie die benötigten Fähigkeiten und die Art der Fachkraft oder des Teams. Empfehlungen basieren auf verifizierten GazaWorks-Datensätzen.", faqBody:"Fragen Sie, wie GazaWorks funktioniert, wie Sie ein Profil verbessern oder eine Plattformfunktion verwenden.", request:"Ihre Anfrage", working:"Wird bearbeitet…", ask:"GazaWorks AI fragen", unavailable:"Die KI-Unterstützung ist noch nicht verbunden.", failed:"Diese Anfrage konnte nicht beantwortet werden." },
    workspace:{ menu:"Arbeitsbereich-Menü", nav:{ overview:"Übersicht", profile:"Profil", portfolio:"Portfolio", verification:"Verifizierung", appointments:"Termine", offers:"Angebote", projects:"Projekte", messages:"Nachrichten", payments:"Zahlungen", disputes:"Streitfälle", reviews:"Bewertungen", cv:"KI-CV-Ersteller", notifications:"Benachrichtigungen", findTalent:"Talente finden", savedTalent:"Gespeicherte Talente", workRequests:"Arbeitsanfragen" }, individualAccount:"Einzelkonto", teamAccount:"Teamkonto", clientAccount:"Kundenkonto", profileReady:"Profil bereit", profileIncomplete:"Profileinrichtung unvollständig", verification:"Verifizierung", status:{ draft:"Entwurf", requested:"Beantragt", under_review:"In Prüfung", interview_required:"Interview erforderlich", interview_scheduled:"Interview geplant", pending:"Ausstehend", verified:"Verifiziert", changes_requested:"Änderungen angefordert", rejected:"Abgelehnt", suspended:"Gesperrt", banned:"Blockiert" }, professionalWorkspace:"Professioneller Arbeitsbereich", welcome:"Willkommen", welcomeBody:"Dies ist Ihr GazaWorks-Arbeitsbereich. Halten Sie Ihr Profil aktuell und folgen Sie dem Ablauf für Ihren Kontotyp.", editProfile:"Profil bearbeiten", completeProfile:"Profil vervollständigen", projects:"Projekte", unreadNotifications:"Ungelesene Benachrichtigungen", conversations:"Unterhaltungen", workRequests:"Arbeitsanfragen", portfolio:"Portfolio", open:"Öffnen →", accountStatus:"Kontostatus", profile:"Profil", ready:"Bereit", incomplete:"Unvollständig", accountType:"Kontotyp", individual:"Einzelperson", team:"Team", client:"Kunde", recommended:"Empfohlener nächster Schritt", clientNext:"Vervollständigen Sie Ihr Kundenprofil, entdecken Sie verifizierte Talente oder veröffentlichen Sie eine Arbeitsanfrage.", findTalent:"Talente finden", postWorkRequest:"Arbeitsanfrage veröffentlichen", verifiedNext:"Ihr Basisprofil ist bereit. Fahren Sie mit der professionellen Verifizierung fort und buchen Sie einen persönlichen Termin, sobald einer verfügbar ist.", continueVerification:"Zur Verifizierung", profileNext:"Fügen Sie Berufsbezeichnung, Biografie, Standort in Gaza, Verfügbarkeit, Fähigkeiten, Erfahrung und Preise hinzu, bevor Sie die Verifizierung beantragen.", completeProfessionalProfile:"Berufsprofil vervollständigen", notApplicable:"Nicht zutreffend" },
    pages:{ talentBadge:"Anmeldung erforderlich · nur verifizierte Talente", talentTitle:"Die passende Fachkraft finden", workRequestTitle:"Arbeitsanfrage erstellen", workRequestBody:"Beschreiben Sie einen echten Auftrag oder ein Projekt für verifizierte GazaWorks-Talente.", cvBadge:"KI-unterstützt · Sie behalten die Kontrolle", cvTitle:"CV-Ersteller", cvBody:"Erstellen Sie einen professionellen Lebenslauf, verbessern Sie Formulierungen mit KI und drucken oder speichern Sie ihn anschließend als PDF.", teamTitle:"Teamprofil", teamBody:"Importieren Sie ein Team-PDF oder DOCX, um einen Entwurf zu erstellen, und steuern Sie anschließend, wie jedes Mitglied angemeldeten Kunden angezeigt wird." }
  }
};

export function uiCopy(locale: string): UiCopy {
  return copy[(locale in copy ? locale : "en") as Locale];
}
