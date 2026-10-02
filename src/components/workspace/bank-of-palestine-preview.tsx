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
  ar: { title: "تفاصيل دفع المشروع", intro: "ستُربط بوابة بنك فلسطين بعد استلام مواصفات الربط واعتماد تشغيلها. لا تُطلب بيانات بطاقة ولا تُخصم مبالغ الآن.", choose: "اختر مشروعًا ينتظر الدفع", empty: "لا توجد مشاريع بانتظار الدفع.", item: "مشروع مع", amount: "المبلغ المتفق عليه", method: "وسيلة الدفع المخطط لها", bank: "بوابة بنك فلسطين · غير مفعّلة", secure: "عند تفعيل البوابة ستجري عملية الدفع عبر مسار البنك المعتمد؛ لن نحفظ بيانات البطاقة في غزة ووركس.", unavailable: "الدفع الإلكتروني غير متاح حاليًا", note: "لا يبدأ العمل ولا يظهر تنبيه «الدفع مؤمّن» إلا بعد تأكيد تمويل حقيقي من بنك فلسطين.", loading: "تحميل المشاريع…" },
  en: { title: "Project payment details", intro: "Bank of Palestine's gateway will be connected after its integration terms and launch approval are available. No card details or charges are taken now.", choose: "Choose a project awaiting payment", empty: "No projects awaiting payment.", item: "Project with", amount: "Agreed project amount", method: "Planned payment method", bank: "Bank of Palestine gateway · inactive", secure: "Once enabled, payment will follow the bank's approved flow; GazaWorks will not store card details.", unavailable: "Online payment is not available yet", note: "Work cannot start and payment cannot be called secured until Bank of Palestine confirms actual funding.", loading: "Loading projects…" },
  tr: { title: "Proje ödeme ayrıntıları", intro: "Filistin Bankası ödeme altyapısı, entegrasyon bilgileri ve onay sağlandığında bağlanacak. Şu anda kart bilgisi veya ödeme alınmaz.", choose: "Ödeme bekleyen proje seçin", empty: "Ödeme bekleyen proje yok.", item: "Proje ortağı", amount: "Anlaşılan proje tutarı", method: "Planlanan ödeme yöntemi", bank: "Filistin Bankası · etkin değil", secure: "Etkinleştirildiğinde ödeme bankanın onaylı akışı üzerinden yapılacak; GazaWorks kart bilgisi saklamayacak.", unavailable: "Çevrim içi ödeme henüz kullanılamıyor", note: "Banka gerçek ödemeyi doğrulamadan iş başlayamaz ve ödeme güvence altında gösterilemez.", loading: "Projeler yükleniyor…" },
  es: { title: "Detalles de pago del proyecto", intro: "La pasarela del Banco de Palestina se conectará tras recibir las condiciones técnicas y la autorización. Ahora no se solicitan tarjetas ni se hacen cargos.", choose: "Elige un proyecto pendiente de pago", empty: "No hay proyectos pendientes de pago.", item: "Proyecto con", amount: "Importe acordado", method: "Método previsto", bank: "Banco de Palestina · inactivo", secure: "Cuando se active, el pago seguirá el flujo aprobado del banco; GazaWorks no almacenará tarjetas.", unavailable: "Los pagos en línea aún no están disponibles", note: "El trabajo no puede empezar ni figurar como pagado hasta que el banco confirme la financiación real.", loading: "Cargando proyectos…" },
  fr: { title: "Détails du paiement du projet", intro: "La passerelle de la Banque de Palestine sera reliée après réception des modalités techniques et de l'autorisation. Aucune carte ni aucun paiement n'est demandé maintenant.", choose: "Choisir un projet en attente de paiement", empty: "Aucun projet en attente de paiement.", item: "Projet avec", amount: "Montant convenu", method: "Moyen prévu", bank: "Banque de Palestine · inactive", secure: "Une fois activé, le paiement suivra le parcours agréé par la banque ; GazaWorks ne stockera pas les données de carte.", unavailable: "Le paiement en ligne n'est pas encore disponible", note: "Le travail ne peut commencer et le paiement ne peut être déclaré sécurisé avant la confirmation d'un véritable financement par la banque.", loading: "Chargement des projets…" },
  de: { title: "Projektdetails zur Zahlung", intro: "Das Gateway der Bank of Palestine wird nach Erhalt der technischen Vorgaben und Freigabe angebunden. Derzeit werden keine Kartendaten oder Zahlungen erfasst.", choose: "Projekt mit ausstehender Zahlung wählen", empty: "Keine Projekte mit ausstehender Zahlung.", item: "Projekt mit", amount: "Vereinbarter Betrag", method: "Vorgesehene Zahlungsart", bank: "Bank of Palestine · inaktiv", secure: "Nach der Freigabe erfolgt die Zahlung über den genehmigten Bankablauf; GazaWorks speichert keine Kartendaten.", unavailable: "Onlinezahlungen sind noch nicht verfügbar", note: "Arbeit darf erst beginnen und Zahlung erst als gesichert gelten, wenn die Bank die tatsächliche Finanzierung bestätigt.", loading: "Projekte werden geladen…" },
} satisfies Record<Locale, Record<string, string>>;

export function BankOfPalestinePreview({ locale }: { locale: Locale }) {
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

  return <section className="bank-payment-preview card" aria-label={t.title}>
    <header className="bank-payment-preview-heading"><span className="bank-payment-preview-icon"><CreditCard size={25} /></span><div><h2>{t.title}</h2><p>{t.intro}</p></div></header>
    <div className="bank-payment-preview-layout">
      <div className="bank-payment-preview-form">
        <label>{t.choose}<select value={selected} onChange={(event) => setSelected(event.target.value)} disabled={!projects.length}>
          {projects.map((entry) => <option key={entry.id} value={entry.id}>{t.item} {entry.talent?.display_name ?? entry.id.slice(0, 8)}</option>)}
        </select></label>
        <div className="bank-payment-preview-method"><span><CreditCard size={18} />{t.bank}</span><LockKeyhole size={18} /></div>
        <div className="bank-payment-preview-placeholder"><ShieldCheck size={24} /><p>{t.secure}</p></div>
        <button type="button" className="btn" disabled aria-disabled="true">{t.unavailable}</button>
      </div>
      <aside className="bank-payment-preview-summary">
        <span className="badge">{t.amount}</span>
        <strong>{loading ? t.loading : !projects.length ? "—" : amount}</strong>
        {!loading && !projects.length && <p>{t.empty}</p>}
        <div className="bank-payment-preview-rule" />
        <small>{t.note}</small>
      </aside>
    </div>
  </section>;
}
