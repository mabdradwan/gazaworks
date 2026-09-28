"use client";

import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Project = {
  id: string;
  status: string;
  talent?: { display_name?: string } | null;
  project_agreements?: { price_minor?: number; currency?: string }[] | { price_minor?: number; currency?: string } | null;
};

const words = {
  ar: { title: "تفاصيل الدفع للمشروع", intro: "واجهة Stripe جاهزة للربط لاحقًا. لن تُطلب بيانات بطاقة ولن يُخصم أي مبلغ الآن.", choose: "اختر مشروعًا ينتظر الدفع", empty: "لا توجد مشاريع بانتظار الدفع.", item: "مشروع مع", amount: "المبلغ المتفق عليه", method: "وسيلة الدفع", stripe: "Stripe · غير مفعّل", secure: "ستظهر وسيلة الدفع الآمنة من Stripe بعد ربط الحساب والموافقة على تشغيل الدفع.", unavailable: "الدفع الإلكتروني غير متاح حاليًا", note: "لا يبدأ العمل ولا يظهر تنبيه «الدفع مؤمّن» إلا بعد تأكيد تمويل حقيقي من مزوّد معتمد.", loading: "تحميل المشاريع…" },
  en: { title: "Project payment details", intro: "The Stripe screen is prepared for later connection. No card details or charges are taken now.", choose: "Choose a project awaiting payment", empty: "No projects awaiting payment.", item: "Project with", amount: "Agreed project amount", method: "Payment method", stripe: "Stripe · inactive", secure: "Stripe's secure payment form will appear after the account is connected and payments are approved.", unavailable: "Online payment is not available yet", note: "Work cannot start and payment cannot be called secured until a connected provider confirms actual funding.", loading: "Loading projects…" },
  tr: { title: "Proje ödeme ayrıntıları", intro: "Stripe arayüzü ileride bağlanmaya hazır. Şu anda kart bilgisi veya ödeme alınmaz.", choose: "Ödeme bekleyen proje seçin", empty: "Ödeme bekleyen proje yok.", item: "Proje ortağı", amount: "Anlaşılan proje tutarı", method: "Ödeme yöntemi", stripe: "Stripe · etkin değil", secure: "Stripe'ın güvenli ödeme formu, hesap bağlanıp ödemeler onaylandıktan sonra görünecek.", unavailable: "Çevrim içi ödeme henüz kullanılamıyor", note: "Bağlı sağlayıcı gerçek ödemeyi onaylamadan iş başlayamaz ve ödeme güvence altında gösterilemez.", loading: "Projeler yükleniyor…" },
  es: { title: "Detalles de pago del proyecto", intro: "La interfaz Stripe está preparada para conectarla más adelante. No se solicitan tarjetas ni se hacen cargos ahora.", choose: "Elige un proyecto pendiente de pago", empty: "No hay proyectos pendientes de pago.", item: "Proyecto con", amount: "Importe acordado", method: "Método de pago", stripe: "Stripe · inactivo", secure: "El formulario seguro de Stripe aparecerá tras conectar la cuenta y aprobar los pagos.", unavailable: "Los pagos en línea aún no están disponibles", note: "El trabajo no puede comenzar ni figurar como pagado hasta que un proveedor conectado confirme la financiación real.", loading: "Cargando proyectos…" },
  fr: { title: "Détails du paiement du projet", intro: "L'interface Stripe est prête pour une connexion ultérieure. Aucune carte ni aucun paiement n'est demandé maintenant.", choose: "Choisir un projet en attente de paiement", empty: "Aucun projet en attente de paiement.", item: "Projet avec", amount: "Montant convenu", method: "Moyen de paiement", stripe: "Stripe · inactif", secure: "Le formulaire sécurisé de Stripe apparaîtra après la connexion du compte et l'autorisation des paiements.", unavailable: "Le paiement en ligne n'est pas encore disponible", note: "Le travail ne peut commencer et le paiement ne peut être déclaré sécurisé avant la confirmation d'un véritable financement.", loading: "Chargement des projets…" },
  de: { title: "Projektdetails zur Zahlung", intro: "Die Stripe-Oberfläche ist für eine spätere Anbindung vorbereitet. Derzeit werden keine Kartendaten oder Zahlungen erfasst.", choose: "Projekt mit ausstehender Zahlung wählen", empty: "Keine Projekte mit ausstehender Zahlung.", item: "Projekt mit", amount: "Vereinbarter Betrag", method: "Zahlungsmethode", stripe: "Stripe · inaktiv", secure: "Das sichere Stripe-Formular erscheint nach Kontoverknüpfung und Freigabe der Zahlungen.", unavailable: "Onlinezahlungen sind noch nicht verfügbar", note: "Arbeit darf erst beginnen und Zahlung erst als gesichert gelten, wenn ein angebundener Anbieter die Finanzierung bestätigt.", loading: "Projekte werden geladen…" },
} satisfies Record<Locale, Record<string, string>>;

export function StripePreview({ locale }: { locale: Locale }) {
  const t = words[locale];
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/projects", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as Project[];
        const awaiting = data.filter((project) => project.status === "awaiting_payment" || project.status === "offer_accepted");
        setProjects(awaiting);
        setSelected(awaiting[0]?.id ?? "");
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const project = projects.find((entry) => entry.id === selected);
  const record = project?.project_agreements;
  const agreement = Array.isArray(record) ? record[0] : record;
  const validAmount = agreement && Number.isSafeInteger(agreement.price_minor) && (agreement.price_minor ?? 0) > 0;
  const amount = validAmount ? new Intl.NumberFormat(locale, { style: "currency", currency: agreement.currency ?? "USD" }).format((agreement.price_minor ?? 0) / 100) : "—";

  return <section className="stripe-preview card" aria-label={t.title}>
    <header className="stripe-preview-heading"><span className="stripe-preview-icon"><CreditCard size={25} /></span><div><h2>{t.title}</h2><p>{t.intro}</p></div></header>
    <div className="stripe-preview-layout">
      <div className="stripe-preview-form">
        <label>{t.choose}<select value={selected} onChange={(event) => setSelected(event.target.value)} disabled={!projects.length}>
          {projects.map((entry) => <option key={entry.id} value={entry.id}>{t.item} {entry.talent?.display_name ?? entry.id.slice(0, 8)}</option>)}
        </select></label>
        <div className="stripe-preview-method"><span><CreditCard size={18} />{t.stripe}</span><LockKeyhole size={18} /></div>
        <div className="stripe-preview-placeholder"><ShieldCheck size={24} /><p>{t.secure}</p></div>
        <button type="button" className="btn" disabled aria-disabled="true">{t.unavailable}</button>
      </div>
      <aside className="stripe-preview-summary">
        <span className="badge">{t.amount}</span>
        <strong>{loading ? t.loading : !projects.length ? "—" : amount}</strong>
        {!loading && !projects.length && <p>{t.empty}</p>}
        <div className="stripe-preview-rule" />
        <small>{t.note}</small>
      </aside>
    </div>
  </section>;
}
