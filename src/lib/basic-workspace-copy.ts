import {isLocale,type Locale} from "@/lib/i18n";

type FavoritesCopy={accountOnly:string;team:string;individual:string;saved:string;view:string;remove:string;empty:string};
type SecurityCopy={loadFailed:string;title:string;description:string;newDevice:string;signIn:string;empty:string;browser:string};
type AvatarCopy={uploading:string;rejected:string;updated:string;saveFailed:string;label:string;placeholder:string;title:string;description:string;choose:string};
type BasicCopy={favorites:FavoritesCopy;security:SecurityCopy;avatar:AvatarCopy};

const copy:Record<Locale,BasicCopy>={
 en:{
  favorites:{accountOnly:"Favorites are available to client accounts.",team:"Team",individual:"Professional",saved:"Saved",view:"View profile",remove:"Remove",empty:"No saved talent yet."},
  security:{loadFailed:"Could not load login history.",title:"Account security",description:"GazaWorks records recent sign-ins and raises an alert for a new browser or device. Raw IP addresses are not displayed.",newDevice:"New device",signIn:"Sign-in",empty:"No login history yet.",browser:"Browser"},
  avatar:{uploading:"Uploading photo…",rejected:"Upload rejected. Use JPG, PNG or WebP under 10 MB.",updated:"Profile photo updated.",saveFailed:"Photo uploaded but could not be saved.",label:"Profile photo",placeholder:"Photo",title:"Profile photo",description:"This photo is shown to authenticated clients after verification. Maximum 10 MB.",choose:"Choose photo"},
 },
 ar:{
  favorites:{accountOnly:"المفضلة متاحة لحسابات العملاء فقط.",team:"فريق",individual:"محترف",saved:"حُفظ في",view:"عرض الملف",remove:"إزالة",empty:"لا توجد مواهب محفوظة بعد."},
  security:{loadFailed:"تعذّر تحميل سجل تسجيل الدخول.",title:"أمان الحساب",description:"يسجل GazaWorks أحدث عمليات الدخول وينبّه عند اكتشاف متصفح أو جهاز جديد. لا تُعرض عناوين IP الخام.",newDevice:"جهاز جديد",signIn:"تسجيل دخول",empty:"لا يوجد سجل تسجيل دخول بعد.",browser:"متصفح"},
  avatar:{uploading:"جارٍ رفع الصورة…",rejected:"رُفض الرفع. استخدم JPG أو PNG أو WebP بحجم أقل من 10 ميغابايت.",updated:"تم تحديث الصورة الشخصية.",saveFailed:"تم رفع الصورة لكن تعذّر حفظها.",label:"الصورة الشخصية",placeholder:"صورة",title:"الصورة الشخصية",description:"تظهر هذه الصورة للعملاء المسجلين بعد التحقق. الحد الأقصى 10 ميغابايت.",choose:"اختيار صورة"},
 },
 tr:{
  favorites:{accountOnly:"Favoriler yalnızca müşteri hesapları tarafından kullanılabilir.",team:"Ekip",individual:"Profesyonel",saved:"Kaydedildi",view:"Profili görüntüle",remove:"Kaldır",empty:"Henüz kaydedilmiş yetenek yok."},
  security:{loadFailed:"Giriş geçmişi yüklenemedi.",title:"Hesap güvenliği",description:"GazaWorks son girişleri kaydeder ve yeni bir tarayıcı veya cihaz algılandığında uyarı verir. Ham IP adresleri gösterilmez.",newDevice:"Yeni cihaz",signIn:"Giriş",empty:"Henüz giriş geçmişi yok.",browser:"Tarayıcı"},
  avatar:{uploading:"Fotoğraf yükleniyor…",rejected:"Yükleme reddedildi. 10 MB altındaki JPG, PNG veya WebP dosyalarını kullanın.",updated:"Profil fotoğrafı güncellendi.",saveFailed:"Fotoğraf yüklendi ancak kaydedilemedi.",label:"Profil fotoğrafı",placeholder:"Fotoğraf",title:"Profil fotoğrafı",description:"Bu fotoğraf doğrulamadan sonra oturum açmış müşterilere gösterilir. En fazla 10 MB.",choose:"Fotoğraf seç"},
 },
 es:{
  favorites:{accountOnly:"Los favoritos solo están disponibles para cuentas de cliente.",team:"Equipo",individual:"Profesional",saved:"Guardado",view:"Ver perfil",remove:"Eliminar",empty:"Aún no hay talento guardado."},
  security:{loadFailed:"No se pudo cargar el historial de acceso.",title:"Seguridad de la cuenta",description:"GazaWorks registra los accesos recientes y avisa cuando detecta un navegador o dispositivo nuevo. No se muestran direcciones IP sin anonimizar.",newDevice:"Dispositivo nuevo",signIn:"Acceso",empty:"Aún no hay historial de acceso.",browser:"Navegador"},
  avatar:{uploading:"Subiendo foto…",rejected:"Carga rechazada. Usa JPG, PNG o WebP de menos de 10 MB.",updated:"Foto de perfil actualizada.",saveFailed:"La foto se subió, pero no se pudo guardar.",label:"Foto de perfil",placeholder:"Foto",title:"Foto de perfil",description:"Esta foto se muestra a clientes autenticados después de la verificación. Máximo 10 MB.",choose:"Elegir foto"},
 },
 fr:{
  favorites:{accountOnly:"Les favoris sont réservés aux comptes clients.",team:"Équipe",individual:"Professionnel",saved:"Enregistré",view:"Voir le profil",remove:"Retirer",empty:"Aucun talent enregistré pour le moment."},
  security:{loadFailed:"Impossible de charger l’historique de connexion.",title:"Sécurité du compte",description:"GazaWorks enregistre les connexions récentes et signale tout nouveau navigateur ou appareil. Les adresses IP brutes ne sont pas affichées.",newDevice:"Nouvel appareil",signIn:"Connexion",empty:"Aucun historique de connexion pour le moment.",browser:"Navigateur"},
  avatar:{uploading:"Importation de la photo…",rejected:"Importation refusée. Utilisez un fichier JPG, PNG ou WebP de moins de 10 Mo.",updated:"Photo de profil mise à jour.",saveFailed:"La photo a été importée, mais n’a pas pu être enregistrée.",label:"Photo de profil",placeholder:"Photo",title:"Photo de profil",description:"Cette photo est visible par les clients connectés après vérification. Taille maximale : 10 Mo.",choose:"Choisir une photo"},
 },
 de:{
  favorites:{accountOnly:"Favoriten sind nur für Kundenkonten verfügbar.",team:"Team",individual:"Fachkraft",saved:"Gespeichert",view:"Profil ansehen",remove:"Entfernen",empty:"Noch keine Talente gespeichert."},
  security:{loadFailed:"Der Anmeldeverlauf konnte nicht geladen werden.",title:"Kontosicherheit",description:"GazaWorks zeichnet kürzliche Anmeldungen auf und warnt bei einem neuen Browser oder Gerät. Unverarbeitete IP-Adressen werden nicht angezeigt.",newDevice:"Neues Gerät",signIn:"Anmeldung",empty:"Noch kein Anmeldeverlauf vorhanden.",browser:"Browser"},
  avatar:{uploading:"Foto wird hochgeladen…",rejected:"Upload abgelehnt. Verwenden Sie JPG, PNG oder WebP unter 10 MB.",updated:"Profilfoto aktualisiert.",saveFailed:"Das Foto wurde hochgeladen, konnte aber nicht gespeichert werden.",label:"Profilfoto",placeholder:"Foto",title:"Profilfoto",description:"Dieses Foto ist nach der Verifizierung für angemeldete Kunden sichtbar. Maximal 10 MB.",choose:"Foto auswählen"},
 },
};

export function basicWorkspaceCopy(locale:string):BasicCopy&{language:Locale}{
 const language=isLocale(locale)?locale:"en";
 return {...copy[language],language};
}
