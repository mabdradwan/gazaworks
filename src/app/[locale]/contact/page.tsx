import { notFound } from "next/navigation";
import { ContactForm } from "@/components/forms/contact-form";
import { emailIsConfigured } from "@/lib/email/provider";
import { isLocale, messages } from "@/lib/i18n";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = messages(locale).pages.contact;
  return <section className="container contact-page">
    <div className="page-heading"><span className="badge">GazaWorks</span><h1>{copy.title}</h1><p className="muted">{copy.description}</p></div>
    <ContactForm locale={locale} enabled={emailIsConfigured()} />
  </section>;
}
