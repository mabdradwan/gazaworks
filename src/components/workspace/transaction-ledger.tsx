"use client";
import {latinLocale} from "@/lib/formatting";


import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Payment = { status: string; simulated: boolean; created_at: string };
type Payout = { status: string; amount_minor: number; payout_date?: string | null };
type Transaction = {
  id: string; project_id: string; gross_minor: number; platform_deduction_minor: number;
  provider_fee_minor: number; platform_revenue_minor: number; worker_entitlement_minor: number;
  currency: string; dispute_state: string; created_at: string;
  payments: Payment[] | null; payouts: Payout[] | null;
};

const copy = {
  ar: { title: "سجل المعاملات", intro: "تُحسب المبالغ برمجيًا من الإعدادات المعتمدة. لا تعني هذه الشاشة تفعيل الدفع البنكي.", empty: "لا توجد معاملات بعد.", loading: "تحميل المعاملات…", error: "تعذّر تحميل المعاملات. حاول مجددًا لاحقًا.", gross: "قيمة المشروع", deduction: "إجمالي الخصم", worker: "مستحق العامل", provider: "تكلفة مزوّد الدفع", revenue: "صافي المنصة", payment: "حالة الدفع", payout: "حالة الصرف", dispute: "النزاع", project: "رقم المشروع", simulated: "محاكاة تطوير فقط", none: "غير متاح" },
  en: { title: "Transaction ledger", intro: "Amounts are calculated from approved settings. This screen does not activate bank payments.", empty: "No transactions yet.", loading: "Loading transactions…", error: "Transactions could not be loaded. Try again later.", gross: "Project amount", deduction: "Total deduction", worker: "Worker entitlement", provider: "Provider cost", revenue: "Platform net", payment: "Payment status", payout: "Payout status", dispute: "Dispute", project: "Project ID", simulated: "Development simulation only", none: "Unavailable" },
  tr: { title: "İşlem defteri", intro: "Tutarlar onaylı ayarlardan hesaplanır. Banka ödemeleri henüz etkin değildir.", empty: "Henüz işlem yok.", loading: "İşlemler yükleniyor…", error: "İşlemler yüklenemedi. Daha sonra tekrar deneyin.", gross: "Proje tutarı", deduction: "Toplam kesinti", worker: "Çalışanın hakkı", provider: "Sağlayıcı maliyeti", revenue: "Platform neti", payment: "Ödeme durumu", payout: "Aktarım durumu", dispute: "Uyuşmazlık", project: "Proje numarası", simulated: "Yalnızca geliştirme simülasyonu", none: "Kullanılamıyor" },
  es: { title: "Registro de transacciones", intro: "Los importes se calculan con la configuración aprobada. Esto no activa los pagos bancarios.", empty: "Todavía no hay transacciones.", loading: "Cargando transacciones…", error: "No se pudieron cargar las transacciones. Inténtalo más tarde.", gross: "Importe del proyecto", deduction: "Deducción total", worker: "Importe del profesional", provider: "Coste del proveedor", revenue: "Neto de la plataforma", payment: "Estado del pago", payout: "Estado del abono", dispute: "Disputa", project: "ID del proyecto", simulated: "Solo simulación de desarrollo", none: "No disponible" },
  fr: { title: "Registre des transactions", intro: "Les montants sont calculés selon les paramètres approuvés. Les paiements bancaires ne sont pas activés.", empty: "Aucune transaction pour le moment.", loading: "Chargement des transactions…", error: "Impossible de charger les transactions. Réessayez plus tard.", gross: "Montant du projet", deduction: "Déduction totale", worker: "Dû au professionnel", provider: "Coût du prestataire", revenue: "Net de la plateforme", payment: "État du paiement", payout: "État du versement", dispute: "Litige", project: "ID du projet", simulated: "Simulation de développement uniquement", none: "Indisponible" },
  de: { title: "Transaktionsübersicht", intro: "Beträge werden nach genehmigten Einstellungen berechnet. Bankzahlungen sind hier nicht aktiviert.", empty: "Noch keine Transaktionen.", loading: "Transaktionen werden geladen…", error: "Transaktionen konnten nicht geladen werden. Bitte später erneut versuchen.", gross: "Projektbetrag", deduction: "Gesamtabzug", worker: "Anspruch der Fachkraft", provider: "Anbieterkosten", revenue: "Netto der Plattform", payment: "Zahlungsstatus", payout: "Auszahlungsstatus", dispute: "Streitfall", project: "Projekt-ID", simulated: "Nur Entwicklungssimulation", none: "Nicht verfügbar" },
} satisfies Record<Locale, Record<string, string>>;

function formatMoney(minor: number, currency: string, locale: Locale) {
  if (!Number.isSafeInteger(minor)) return "—";
  try { return new Intl.NumberFormat(latinLocale(locale), { style: "currency", currency }).format(minor / 100); }
  catch { return "—"; }
}

export function TransactionLedger({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [items, setItems] = useState<Transaction[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/payments", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("load_failed");
        const result: unknown = await response.json();
        if (!Array.isArray(result)) throw new Error("invalid_response");
        setItems(result as Transaction[]);
        setStatus("ready");
      })
      .catch(() => { if (!controller.signal.aborted) setStatus("error"); });
    return () => controller.abort();
  }, []);

  return <section className="transaction-ledger" aria-label={t.title}>
    <div className="card"><h2>{t.title}</h2><p className="muted">{t.intro}</p></div>
    {status === "loading" && <p role="status">{t.loading}</p>}
    {status === "error" && <p role="alert">{t.error}</p>}
    {status === "ready" && items.length === 0 && <div className="empty">{t.empty}</div>}
    {status === "ready" && items.map((item) => {
      const payment = item.payments?.[0];
      const payout = item.payouts?.[0];
      return <article key={item.id} className="card transaction-card">
        <header><div><small>{t.project}: <span dir="ltr">{item.project_id.slice(0, 8)}</span></small><h3>{formatMoney(item.gross_minor, item.currency, locale)}</h3></div>{payment?.simulated && <span className="badge">{t.simulated}</span>}</header>
        <div className="transaction-facts">
          <div><span>{t.gross}</span><strong>{formatMoney(item.gross_minor, item.currency, locale)}</strong></div>
          <div><span>{t.deduction}</span><strong>{formatMoney(item.platform_deduction_minor, item.currency, locale)}</strong></div>
          <div><span>{t.worker}</span><strong>{formatMoney(item.worker_entitlement_minor, item.currency, locale)}</strong></div>
          <div><span>{t.provider}</span><strong>{formatMoney(item.provider_fee_minor, item.currency, locale)}</strong></div>
          <div><span>{t.revenue}</span><strong>{formatMoney(item.platform_revenue_minor, item.currency, locale)}</strong></div>
          <div><span>{t.payment}</span><strong>{payment?.status ?? t.none}</strong></div>
          <div><span>{t.payout}</span><strong>{payout?.status ?? t.none}</strong></div>
          <div><span>{t.dispute}</span><strong>{item.dispute_state}</strong></div>
        </div>
      </article>;
    })}
  </section>;
}
