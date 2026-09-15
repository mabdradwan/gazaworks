export type AuthLocale="ar"|"en"|"tr"|"es"|"fr"|"de";

type AuthCopy={
  signIn:string; create:string; welcome:string; join:string; name:string; accountType:string; choose:string;
  individual:string; team:string; client:string; email:string; password:string; wait:string; createSecure:string;
  google:string; confirm:string; forgot:string; failed:string; chooseType:string; resetTitle:string; resetButton:string;
  resetSent:string; back:string;
};

const en:AuthCopy={
  signIn:"Sign in",create:"Create account",welcome:"Welcome back",join:"Join GazaWorks",
  name:"Full or professional name",accountType:"Permanent account type",choose:"Select one",
  individual:"Individual professional from Gaza",team:"Team / startup / agency from Gaza",client:"International client / organization",
  email:"Email",password:"Password",wait:"Please wait…",createSecure:"Create secure account",
  google:"Continue with Google",confirm:"Check your email to confirm your account.",forgot:"Forgot password?",
  failed:"Authentication failed",chooseType:"Choose an account type before continuing with Google.",
  resetTitle:"Reset password",resetButton:"Send reset link",resetSent:"Check your email for the secure reset link.",back:"Back to sign in"
};

const copy:Record<AuthLocale,AuthCopy>={
  en,
  ar:{...en,signIn:"تسجيل الدخول",create:"إنشاء حساب",welcome:"مرحبًا بعودتك",join:"انضم إلى GazaWorks",name:"الاسم الكامل أو المهني",accountType:"نوع الحساب الدائم",choose:"اختر نوع الحساب",individual:"محترف فردي من غزة",team:"فريق / شركة ناشئة / وكالة من غزة",client:"عميل / شركة / منظمة من خارج غزة",email:"البريد الإلكتروني",password:"كلمة المرور",wait:"يرجى الانتظار…",createSecure:"إنشاء حساب آمن",google:"المتابعة باستخدام Google",confirm:"تحقق من بريدك الإلكتروني لتأكيد الحساب.",forgot:"نسيت كلمة المرور؟",failed:"فشلت عملية المصادقة",chooseType:"اختر نوع الحساب قبل المتابعة باستخدام Google.",resetTitle:"إعادة تعيين كلمة المرور",resetButton:"إرسال رابط إعادة التعيين",resetSent:"تحقق من بريدك الإلكتروني للحصول على رابط إعادة التعيين الآمن.",back:"العودة لتسجيل الدخول"},
  tr:{...en,signIn:"Giriş yap",create:"Hesap oluştur",welcome:"Tekrar hoş geldiniz",join:"GazaWorks'e katıl",name:"Tam veya profesyonel ad",accountType:"Kalıcı hesap türü",choose:"Birini seçin",individual:"Gazze'den bireysel profesyonel",team:"Gazze'den ekip / girişim / ajans",client:"Uluslararası müşteri / kuruluş",email:"E-posta",password:"Şifre",wait:"Lütfen bekleyin…",createSecure:"Güvenli hesap oluştur",google:"Google ile devam et",confirm:"Hesabınızı doğrulamak için e-postanızı kontrol edin.",forgot:"Şifrenizi mi unuttunuz?",failed:"Kimlik doğrulama başarısız",chooseType:"Google ile devam etmeden önce hesap türünü seçin.",resetTitle:"Şifreyi sıfırla",resetButton:"Sıfırlama bağlantısı gönder",resetSent:"Güvenli sıfırlama bağlantısı için e-postanızı kontrol edin.",back:"Girişe dön"},
  es:{...en,signIn:"Iniciar sesión",create:"Crear cuenta",welcome:"Bienvenido de nuevo",join:"Únete a GazaWorks",name:"Nombre completo o profesional",accountType:"Tipo de cuenta permanente",choose:"Selecciona una opción",individual:"Profesional individual de Gaza",team:"Equipo / startup / agencia de Gaza",client:"Cliente / organización internacional",email:"Correo electrónico",password:"Contraseña",wait:"Espera…",createSecure:"Crear cuenta segura",google:"Continuar con Google",confirm:"Revisa tu correo para confirmar tu cuenta.",forgot:"¿Olvidaste tu contraseña?",failed:"Error de autenticación",chooseType:"Selecciona un tipo de cuenta antes de continuar con Google.",resetTitle:"Restablecer contraseña",resetButton:"Enviar enlace",resetSent:"Revisa tu correo para obtener el enlace seguro.",back:"Volver al inicio de sesión"},
  fr:{...en,signIn:"Se connecter",create:"Créer un compte",welcome:"Bon retour",join:"Rejoindre GazaWorks",name:"Nom complet ou professionnel",accountType:"Type de compte permanent",choose:"Sélectionner",individual:"Professionnel individuel de Gaza",team:"Équipe / startup / agence de Gaza",client:"Client / organisation internationale",email:"E-mail",password:"Mot de passe",wait:"Veuillez patienter…",createSecure:"Créer un compte sécurisé",google:"Continuer avec Google",confirm:"Consultez votre e-mail pour confirmer votre compte.",forgot:"Mot de passe oublié ?",failed:"Échec de l’authentification",chooseType:"Choisissez un type de compte avant de continuer avec Google.",resetTitle:"Réinitialiser le mot de passe",resetButton:"Envoyer le lien",resetSent:"Consultez votre e-mail pour le lien sécurisé.",back:"Retour à la connexion"},
  de:{...en,signIn:"Anmelden",create:"Konto erstellen",welcome:"Willkommen zurück",join:"GazaWorks beitreten",name:"Vollständiger oder beruflicher Name",accountType:"Dauerhafter Kontotyp",choose:"Bitte auswählen",individual:"Einzelne Fachkraft aus Gaza",team:"Team / Startup / Agentur aus Gaza",client:"Internationaler Kunde / Organisation",email:"E-Mail",password:"Passwort",wait:"Bitte warten…",createSecure:"Sicheres Konto erstellen",google:"Mit Google fortfahren",confirm:"Prüfen Sie Ihre E-Mail, um das Konto zu bestätigen.",forgot:"Passwort vergessen?",failed:"Authentifizierung fehlgeschlagen",chooseType:"Wählen Sie vor der Google-Anmeldung einen Kontotyp.",resetTitle:"Passwort zurücksetzen",resetButton:"Link senden",resetSent:"Prüfen Sie Ihre E-Mail auf den sicheren Link.",back:"Zur Anmeldung"}
};

export function authCopy(locale:string):AuthCopy{return copy[locale as AuthLocale]??en}
