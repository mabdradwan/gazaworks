import {isLocale,type Locale} from "@/lib/i18n";
interface Notice {category:string;title:string;body:string}
const security:Record<Locale,readonly [string,string,string]>={"en":["Security","New sign-in detected","A sign-in from a new browser or device was recorded on your GazaWorks account."],"ar":["الأمان","تم رصد تسجيل دخول جديد","تم تسجيل دخول إلى حسابك في GazaWorks من متصفح أو جهاز جديد."],"tr":["Güvenlik","Yeni giriş tespit edildi","GazaWorks hesabınıza yeni bir tarayıcı veya cihazdan giriş kaydedildi."],"es":["Seguridad","Se detectó un nuevo inicio de sesión","Se registró un acceso a tu cuenta de GazaWorks desde un navegador o dispositivo nuevo."],"fr":["Sécurité","Nouvelle connexion détectée","Une connexion à votre compte GazaWorks depuis un nouveau navigateur ou appareil a été enregistrée."],"de":["Sicherheit","Neue Anmeldung erkannt","Eine Anmeldung bei Ihrem GazaWorks-Konto über einen neuen Browser oder ein neues Gerät wurde registriert."]};
export function notificationPresentation(locale:string,notice:Notice){
 const c=security[isLocale(locale)?locale:"en"];
 const login=notice.category==="security"&&notice.title===security.en[1]&&notice.body===security.en[2];
 return {category:notice.category==="security"?c[0]:notice.category.replaceAll("_"," "),title:login?c[1]:notice.title,body:login?c[2]:notice.body};
}
