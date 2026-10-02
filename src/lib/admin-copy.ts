import { isLocale, type Locale } from "@/lib/i18n";
import { workspaceCopy } from "@/lib/workspace-copy";

const extraKeys = [
  "Users", "Individuals", "Teams", "Clients", "Message Moderation", "Transactions",
  "Payouts", "Appeals", "Blog", "Static Pages", "Media", "Categories",
  "Skills", "Languages", "Email Templates", "AI Settings", "Payment Settings",
  "System Settings", "Security Logs", "Audit Logs", "Roles",
] as const;

const extras: Record<Locale, readonly string[]> = {
  en: extraKeys,
  ar: ["المستخدمون", "الأفراد", "الفرق", "العملاء", "مراجعة الرسائل", "المعاملات", "صرف المستحقات", "الاستئنافات", "المقالات", "الصفحات الثابتة", "الوسائط", "التصنيفات", "المهارات", "اللغات", "قوالب البريد", "إعدادات الذكاء الاصطناعي", "إعدادات الدفع", "إعدادات النظام", "سجلات الأمان", "سجلات التدقيق", "الأدوار"],
  tr: ["Kullanıcılar", "Bireyler", "Ekipler", "Müşteriler", "Mesaj denetimi", "İşlemler", "Hak ediş ödemeleri", "İtirazlar", "Makaleler", "Statik sayfalar", "Medya", "Kategoriler", "Beceriler", "Diller", "E-posta şablonları", "Yapay zekâ ayarları", "Ödeme ayarları", "Sistem ayarları", "Güvenlik kayıtları", "Denetim kayıtları", "Roller"],
  es: ["Usuarios", "Profesionales", "Equipos", "Clientes", "Moderación de mensajes", "Transacciones", "Desembolsos", "Apelaciones", "Artículos", "Páginas estáticas", "Medios", "Categorías", "Habilidades", "Idiomas", "Plantillas de correo", "Ajustes de IA", "Ajustes de pago", "Ajustes del sistema", "Registros de seguridad", "Registros de auditoría", "Roles"],
  fr: ["Utilisateurs", "Professionnels", "Équipes", "Clients", "Modération des messages", "Transactions", "Versements", "Recours", "Articles", "Pages statiques", "Médias", "Catégories", "Compétences", "Langues", "Modèles d’e-mail", "Réglages de l’IA", "Réglages de paiement", "Réglages du système", "Journal de sécurité", "Journal d’audit", "Rôles"],
  de: ["Nutzer", "Fachkräfte", "Teams", "Kunden", "Nachrichtenmoderation", "Transaktionen", "Auszahlungen", "Einsprüche", "Artikel", "Statische Seiten", "Medien", "Kategorien", "Fähigkeiten", "Sprachen", "E-Mail-Vorlagen", "KI-Einstellungen", "Zahlungseinstellungen", "Systemeinstellungen", "Sicherheitsprotokolle", "Prüfprotokolle", "Rollen"],
};

const shell: Record<Locale, readonly [string, string, string, string, string, string]> = {
  en: ["Administration", "Access controlled by role", "GazaWorks administration", "Manage verification, finance, moderation, content and disputes according to your assigned permissions.", "Operations", "Actions are checked against your permissions and recorded in the audit log."],
  ar: ["الإدارة", "الوصول حسب الصلاحيات", "إدارة غزة ووركس", "أدر التحقق والماليات والمراجعة والمحتوى والنزاعات وفق الصلاحيات الممنوحة لك.", "العمليات", "تُراجع صلاحيتك قبل كل إجراء إداري وتُسجّل الإجراءات المهمة في سجل التدقيق."],
  tr: ["Yönetim", "Role göre erişim", "GazaWorks yönetimi", "Doğrulama, finans, denetim, içerik ve anlaşmazlıkları yetkilerinize göre yönetin.", "İşlemler", "Yönetim işlemleri için yetkiler kontrol edilir ve önemli adımlar kayıt altına alınır."],
  es: ["Administración", "Acceso según rol", "Administración de GazaWorks", "Gestione verificación, finanzas, moderación, contenido y disputas según sus permisos.", "Operaciones", "Se comprueban los permisos y se registran las acciones administrativas importantes."],
  fr: ["Administration", "Accès selon le rôle", "Administration de GazaWorks", "Gérez la vérification, les finances, la modération, le contenu et les litiges selon vos droits.", "Opérations", "Les droits sont vérifiés et les actions administratives importantes sont consignées."],
  de: ["Verwaltung", "Rollengesteuerter Zugriff", "GazaWorks-Verwaltung", "Verwalten Sie Verifizierung, Finanzen, Moderation, Inhalte und Streitfälle gemäß Ihren Berechtigungen.", "Vorgänge", "Berechtigungen werden geprüft und wichtige Verwaltungsaktionen protokolliert."],
};

export function adminCopy(locale: string) {
  const language = isLocale(locale) ? locale : "en";
  const [menu, badge, title, intro, operations, operationsBody] = shell[language];
  return {
    menu, badge, title, intro, operations, operationsBody,
    label: (key: string) => {
      const index = extraKeys.indexOf(key as typeof extraKeys[number]);
      return index < 0 ? workspaceCopy(language).label(key) : extras[language][index];
    },
  };
}
