import type { Locale } from "@/lib/i18n";

export type PolicySlug =
  | "terms" | "privacy" | "payment-policy" | "dispute-policy"
  | "verification-policy" | "community-guidelines" | "faq";

type Entry = { title: string; description: string };

const copy: Record<Locale, Record<PolicySlug, Entry>> = {
  ar: {
    terms: { title: "شروط الاستخدام", description: "تنظم هذه الصفحة شروط استخدام غزة ووركس. النص الكامل قيد المراجعة قبل الإطلاق التشغيلي." },
    privacy: { title: "سياسة الخصوصية", description: "توضح هذه الصفحة كيفية التعامل مع بيانات الحساب والتحقق والملفات المهنية. النص الكامل قيد المراجعة قبل الإطلاق التشغيلي." },
    "payment-policy": { title: "سياسة الدفع", description: "الدفع الإلكتروني غير متاح حاليًا. ستُنشر شروط التمويل والرسوم والاسترداد بعد اعتماد بوابة بنك فلسطين والمسار التشغيلي والقانوني." },
    "dispute-policy": { title: "سياسة النزاعات", description: "عند تفعيل المشاريع المدفوعة، سيُراجع فريق غزة ووركس النزاعات والأدلة والاستئناف يدويًا. تفاصيل السياسة النهائية قيد المراجعة." },
    "verification-policy": { title: "سياسة التحقق", description: "لا تُمنح شارة التحقق تلقائيًا. تتطلب مراجعة بشرية وتأكيد الهوية والتواجد في غزة؛ تفاصيل الإجراءات الكاملة قيد المراجعة." },
    "community-guidelines": { title: "إرشادات المجتمع", description: "نتوقع تواصلًا مهنيًا محترمًا وحفظ تفاصيل التعاون داخل المنصة. الإرشادات التفصيلية قيد المراجعة." },
    faq: { title: "الأسئلة الشائعة", description: "كيف يتم التحقق؟ يراجع الفريق الهوية والتواجد في غزة حضوريًا قبل منح الشارة.\nهل الدفع متاح؟ لا، بوابة بنك فلسطين لم تُربط بعد.\nهل يستطيع العميل رؤية الملفات المهنية؟ نعم، بعد تسجيل الدخول ووفق الصلاحيات." },
  },
  en: {
    terms: { title: "Terms of Service", description: "This page will govern the use of GazaWorks. The complete terms are under review before the operational launch." },
    privacy: { title: "Privacy Policy", description: "This page will explain how account, verification and professional profile data are handled. The complete policy is under review." },
    "payment-policy": { title: "Payment Policy", description: "Online payments are not available yet. Funding, fee and refund terms will be published after the Bank of Palestine gateway and the operating and legal model are approved." },
    "dispute-policy": { title: "Dispute Policy", description: "When funded projects become available, GazaWorks staff will review disputes, evidence and appeals. The final detailed policy is under review." },
    "verification-policy": { title: "Verification Policy", description: "Verification badges are never granted automatically. Human review of identity and presence in Gaza is required; detailed procedures are under review." },
    "community-guidelines": { title: "Community Guidelines", description: "We expect respectful professional communication and project discussions to stay on the platform. Detailed guidelines are under review." },
    faq: { title: "Frequently asked questions", description: "How does verification work? Staff review identity and presence in Gaza in person before granting a badge.\nAre payments available? No, the Bank of Palestine gateway is not connected yet.\nCan a client view professional profiles? Yes, after signing in and subject to access rules." },
  },
  tr: {
    terms: { title: "Kullanım Koşulları", description: "Bu sayfa GazaWorks kullanım koşullarını açıklayacaktır. Tam metin faaliyete geçmeden önce incelenmektedir." },
    privacy: { title: "Gizlilik Politikası", description: "Hesap, doğrulama ve mesleki profil verilerinin nasıl işlendiği burada açıklanacaktır. Tam politika incelenmektedir." },
    "payment-policy": { title: "Ödeme Politikası", description: "Çevrimiçi ödemeler henüz kullanılamıyor. Fonlama, ücret ve iade koşulları Bank of Palestine ağ geçidi ve yasal süreç onaylandıktan sonra yayımlanacaktır." },
    "dispute-policy": { title: "Uyuşmazlık Politikası", description: "Ücretli projeler açıldığında uyuşmazlıklar, kanıtlar ve itirazlar GazaWorks ekibi tarafından incelenecektir. Ayrıntılı politika incelenmektedir." },
    "verification-policy": { title: "Doğrulama Politikası", description: "Doğrulama rozeti otomatik verilmez. Kimliğin ve Gazze'de bulunmanın insan eliyle incelenmesi gerekir; ayrıntılı süreç incelenmektedir." },
    "community-guidelines": { title: "Topluluk Kuralları", description: "Saygılı ve profesyonel iletişim ile proje görüşmelerinin platformda kalmasını bekliyoruz. Ayrıntılı kurallar incelenmektedir." },
    faq: { title: "Sıkça sorulan sorular", description: "Doğrulama nasıl yapılır? Ekip rozet vermeden önce kimliği ve Gazze'de bulunmayı yüz yüze inceler.\nÖdemeler açık mı? Hayır, Bank of Palestine ağ geçidi henüz bağlı değil.\nMüşteri profilleri görebilir mi? Evet, oturum açıp erişim koşullarını karşıladıktan sonra." },
  },
  es: {
    terms: { title: "Términos de servicio", description: "Esta página explicará las condiciones de uso de GazaWorks. El texto completo está en revisión antes del lanzamiento operativo." },
    privacy: { title: "Política de privacidad", description: "Aquí se explicará el tratamiento de los datos de cuenta, verificación y perfiles profesionales. La política completa está en revisión." },
    "payment-policy": { title: "Política de pagos", description: "Los pagos en línea aún no están disponibles. Las condiciones de financiación, comisiones y reembolsos se publicarán tras la aprobación de la pasarela de Bank of Palestine y del modelo legal y operativo." },
    "dispute-policy": { title: "Política de disputas", description: "Cuando se habiliten los proyectos financiados, el equipo de GazaWorks revisará disputas, pruebas y apelaciones. La política detallada está en revisión." },
    "verification-policy": { title: "Política de verificación", description: "La insignia de verificación nunca se concede automáticamente. Se requiere revisión humana de la identidad y la presencia en Gaza; el procedimiento detallado está en revisión." },
    "community-guidelines": { title: "Normas de la comunidad", description: "Esperamos comunicación profesional y respetuosa y que las conversaciones sobre proyectos permanezcan en la plataforma. Las normas detalladas están en revisión." },
    faq: { title: "Preguntas frecuentes", description: "¿Cómo se verifica un perfil? El equipo revisa en persona la identidad y la presencia en Gaza antes de conceder la insignia.\n¿Hay pagos? No, aún no se ha conectado la pasarela de Bank of Palestine.\n¿Puede un cliente ver perfiles? Sí, después de iniciar sesión y según sus permisos." },
  },
  fr: {
    terms: { title: "Conditions d’utilisation", description: "Cette page précisera les conditions d’utilisation de GazaWorks. Le texte complet est en cours de révision avant le lancement opérationnel." },
    privacy: { title: "Politique de confidentialité", description: "Cette page précisera le traitement des données de compte, de vérification et des profils professionnels. La politique complète est en cours de révision." },
    "payment-policy": { title: "Politique de paiement", description: "Les paiements en ligne ne sont pas encore disponibles. Les modalités de financement, de frais et de remboursement seront publiées après validation de la passerelle Bank of Palestine et du cadre opérationnel et juridique." },
    "dispute-policy": { title: "Politique des litiges", description: "Lorsque les projets financés seront disponibles, l’équipe GazaWorks examinera les litiges, preuves et recours. La politique détaillée est en cours de révision." },
    "verification-policy": { title: "Politique de vérification", description: "Le badge de vérification n’est jamais accordé automatiquement. L’identité et la présence à Gaza doivent être examinées par une personne ; la procédure détaillée est en cours de révision." },
    "community-guidelines": { title: "Règles de la communauté", description: "Nous attendons des échanges professionnels et respectueux et des discussions de projet sur la plateforme. Les règles détaillées sont en cours de révision." },
    faq: { title: "Questions fréquentes", description: "Comment fonctionne la vérification ? L’équipe vérifie en personne l’identité et la présence à Gaza avant d’accorder le badge.\nLes paiements sont-ils disponibles ? Non, la passerelle Bank of Palestine n’est pas encore connectée.\nUn client peut-il voir les profils ? Oui, après connexion et selon ses droits d’accès." },
  },
  de: {
    terms: { title: "Nutzungsbedingungen", description: "Diese Seite wird die Nutzung von GazaWorks regeln. Der vollständige Text wird vor dem Betriebsstart geprüft." },
    privacy: { title: "Datenschutzerklärung", description: "Hier wird der Umgang mit Konto-, Verifizierungs- und beruflichen Profildaten erläutert. Die vollständige Erklärung wird noch geprüft." },
    "payment-policy": { title: "Zahlungsrichtlinie", description: "Onlinezahlungen sind noch nicht verfügbar. Bedingungen für Finanzierung, Gebühren und Erstattungen folgen nach Freigabe des Bank-of-Palestine-Gateways und des rechtlichen und betrieblichen Modells." },
    "dispute-policy": { title: "Richtlinie für Streitfälle", description: "Sobald finanzierte Projekte möglich sind, prüfen GazaWorks-Mitarbeitende Streitfälle, Belege und Einsprüche. Die ausführliche Richtlinie wird noch geprüft." },
    "verification-policy": { title: "Verifizierungsrichtlinie", description: "Das Verifizierungsabzeichen wird nie automatisch vergeben. Identität und Aufenthalt in Gaza müssen durch Menschen geprüft werden; das genaue Verfahren wird noch geprüft." },
    "community-guidelines": { title: "Gemeinschaftsregeln", description: "Wir erwarten respektvolle berufliche Kommunikation und Projektgespräche auf der Plattform. Die ausführlichen Regeln werden noch geprüft." },
    faq: { title: "Häufig gestellte Fragen", description: "Wie funktioniert die Verifizierung? Das Team prüft Identität und Aufenthalt in Gaza persönlich, bevor es ein Abzeichen vergibt.\nSind Zahlungen verfügbar? Nein, das Bank-of-Palestine-Gateway ist noch nicht angebunden.\nKönnen Kunden Profile sehen? Ja, nach Anmeldung und gemäß den Zugriffsrechten." },
  },
};

export function policyFallback(locale: Locale, slug: PolicySlug): Entry {
  return copy[locale][slug];
}

export const policyDraftNotice: Record<Locale, string> = {
  ar: "هذه صفحة تعريفية قيد المراجعة. ستُنشر السياسة الكاملة بعد مراجعتها وقبل إطلاق الخدمات ذات الصلة.",
  en: "This is an informational draft. The complete policy will be published after review and before the relevant services launch.",
  tr: "Bu bilgilendirme amaçlı bir taslaktır. Tam politika incelendikten ve ilgili hizmetler başlamadan önce yayımlanacaktır.",
  es: "Este texto es un borrador informativo. La política completa se publicará tras su revisión y antes de activar los servicios correspondientes.",
  fr: "Ceci est un projet d’information. La politique complète sera publiée après examen et avant le lancement des services concernés.",
  de: "Dies ist ein informativer Entwurf. Die vollständige Richtlinie wird nach Prüfung und vor dem Start der jeweiligen Dienste veröffentlicht.",
};
