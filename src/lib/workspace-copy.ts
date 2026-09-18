import type {Locale} from "@/lib/i18n";

const labels = ["Overview","Profile","Portfolio","Verification","Appointments","Direct Hire","Offers","Projects","Messages","Payments","Disputes","Reviews","AI CV Builder","Notifications","Find Talent","Saved Talent","Work Requests","Security"] as const;
type NavLabel = typeof labels[number];
const translations:Record<Locale,readonly string[]> = {
 en:labels,
 ar:["نظرة عامة","الملف الشخصي","معرض الأعمال","التحقق","المواعيد","طلبات العمل المباشرة","العروض","المشاريع","الرسائل","المدفوعات","النزاعات","التقييمات","منشئ السيرة الذاتية بالذكاء الاصطناعي","الإشعارات","البحث عن المواهب","المواهب المحفوظة","طلبات العمل","الأمان"],
 tr:["Genel bakış","Profil","Portföy","Doğrulama","Randevular","Doğrudan iş talepleri","Teklifler","Projeler","Mesajlar","Ödemeler","Uyuşmazlıklar","Değerlendirmeler","Yapay zekâ ile özgeçmiş","Bildirimler","Yetenek bul","Kaydedilen yetenekler","İş talepleri","Güvenlik"],
 es:["Resumen","Perfil","Portafolio","Verificación","Citas","Solicitudes directas","Ofertas","Proyectos","Mensajes","Pagos","Disputas","Valoraciones","Creador de CV con IA","Notificaciones","Buscar talento","Talento guardado","Solicitudes de trabajo","Seguridad"],
 fr:["Vue d’ensemble","Profil","Portfolio","Vérification","Rendez-vous","Demandes directes","Offres","Projets","Messages","Paiements","Litiges","Évaluations","Créateur de CV avec IA","Notifications","Trouver des talents","Talents enregistrés","Demandes de travail","Sécurité"],
 de:["Übersicht","Profil","Portfolio","Verifizierung","Termine","Direkte Arbeitsanfragen","Angebote","Projekte","Nachrichten","Zahlungen","Streitfälle","Bewertungen","KI-Lebenslauf-Assistent","Benachrichtigungen","Talente finden","Gespeicherte Talente","Arbeitsanfragen","Sicherheit"]
};
const shell:Record<Locale,readonly[string,string,string,string,string,string]>={
 en:["Individual account","Team account","Client account","Profile ready","Profile setup incomplete","Workspace menu"],
 ar:["حساب فردي","حساب فريق","حساب عميل","الملف مكتمل","إعداد الملف غير مكتمل","قائمة مساحة العمل"],
 tr:["Bireysel hesap","Ekip hesabı","Müşteri hesabı","Profil tamamlandı","Profil kurulumu eksik","Çalışma alanı menüsü"],
 es:["Cuenta individual","Cuenta de equipo","Cuenta de cliente","Perfil completo","Perfil incompleto","Menú del espacio de trabajo"],
 fr:["Compte individuel","Compte d’équipe","Compte client","Profil complet","Profil incomplet","Menu de l’espace de travail"],
 de:["Einzelkonto","Teamkonto","Kundenkonto","Profil vollständig","Profil unvollständig","Arbeitsbereich-Menü"]
};
export function workspaceCopy(locale:string){
 const language:Locale=Object.hasOwn(translations,locale)?locale as Locale:"en";
 const [individual,team,client,ready,incomplete,menu]=shell[language];
 return {individual,team,client,ready,incomplete,menu,label:(label:string)=>{
  const index=labels.indexOf(label as NavLabel);
  return index<0?label:translations[language][index];
 }};
}
