export const locales = ["ar", "en", "tr", "es", "fr", "de"] as const;
export type Locale = (typeof locales)[number];
export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);
const copy = {
  en: {
    nav: { talent: "Find talent", work: "How it works", trust: "Trust", login: "Sign in", join: "Join GazaWorks" },
    hero: { eyebrow: "Verified professional marketplace", title: "Hire verified talent from Gaza", body: "Work with skilled professionals and teams through secure agreements, protected payments, and accountable delivery.", primary: "Explore talent", secondary: "Post a work request" },
    stats: ["Verified through in-person review", "Private, accountable collaboration", "Payment-secured project workflow"],
    sections: { services: "Built for serious work", talent: "Specialists ready for global teams", cta: "Build exceptional work with Gaza" },
    footer: "Professional opportunity, built on trust."
  },
  ar: {
    nav: { talent: "اكتشف المواهب", work: "كيف نعمل", trust: "الثقة والتحقق", login: "تسجيل الدخول", join: "انضم إلى غزة ووركس" },
    hero: { eyebrow: "سوق مهني موثّق", title: "وظّف مواهب موثّقة من غزة", body: "تعاون مع محترفين وفرق ماهرة عبر اتفاقيات واضحة ومدفوعات محمية وتسليم موثوق.", primary: "استكشف المواهب", secondary: "انشر طلب عمل" },
    stats: ["تحقق مهني ومقابلة حضورية", "تعاون خاص ومسؤول", "مسار مشروع بمدفوعات مؤمّنة"],
    sections: { services: "مصمم للعمل الاحترافي", talent: "خبرات جاهزة للفرق العالمية", cta: "أنجز عملاً استثنائياً مع غزة" },
    footer: "فرص مهنية مبنية على الثقة."
  }
} as const;
export function messages(locale: Locale) { return locale === "ar" ? copy.ar : copy.en; }
export function direction(locale: Locale) { return locale === "ar" ? "rtl" : "ltr"; }
