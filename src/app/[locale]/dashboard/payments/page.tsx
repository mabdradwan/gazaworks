import { notFound } from "next/navigation";
import { PaymentsPanel } from "@/components/workspace/resource-panels";
import { isLocale } from "@/lib/i18n";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { robots: { index: false, follow: false } };
const headings = {
  ar: ["المدفوعات", "سجل المعاملات والدفعات؛ الدفع الإلكتروني غير مفعّل حاليًا."],
  en: ["Payments", "Transaction records and payment status; online payments are not active yet."],
  tr: ["Ödemeler", "İşlem kayıtları ve ödeme durumu; çevrim içi ödemeler henüz etkin değil."],
  es: ["Pagos", "Registros y estado de pagos; los pagos en línea aún no están activos."],
  fr: ["Paiements", "Historique et état des paiements ; les paiements en ligne ne sont pas encore actifs."],
  de: ["Zahlungen", "Transaktionen und Zahlungsstatus; Onlinezahlungen sind noch nicht aktiv."],
} as const;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  const { data: profile } = user ? await db.from("profiles").select("account_type").eq("id", user.id).single() : { data: null };
  return <section className="container" style={{ padding: "40px 0" }}>
    <div className="page-heading"><h1>{headings[locale][0]}</h1><p className="muted">{headings[locale][1]}</p></div>
    <PaymentsPanel locale={locale} accountType={profile?.account_type} />
  </section>;
}
