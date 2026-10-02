"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n";

const copy = {
  ar: { name: "الاسم", email: "البريد الإلكتروني", topic: "الموضوع", general: "استفسار عام", verification: "التحقق", technical: "مشكلة تقنية", message: "رسالتك", send: "إرسال الرسالة", sending: "جارٍ الإرسال…", sent: "وصلتنا رسالتك. سنتواصل معك عبر البريد الإلكتروني.", failed: "تعذّر الإرسال الآن. حاول مجددًا لاحقًا.", unavailable: "استقبال الرسائل بالبريد غير مفعل حاليًا. ستتوفر الاستمارة عند اكتمال ربط Brevo." },
  en: { name: "Name", email: "Email address", topic: "Topic", general: "General question", verification: "Verification", technical: "Technical issue", message: "Your message", send: "Send message", sending: "Sending…", sent: "Your message was received. We will reply by email.", failed: "Your message could not be sent. Please try later.", unavailable: "Email contact is not active yet. This form will open once Brevo is connected." },
  tr: { name: "Ad", email: "E-posta", topic: "Konu", general: "Genel soru", verification: "Doğrulama", technical: "Teknik sorun", message: "Mesajınız", send: "Mesaj gönder", sending: "Gönderiliyor…", sent: "Mesajınız alındı. E-posta ile yanıtlayacağız.", failed: "Mesaj gönderilemedi. Daha sonra tekrar deneyin.", unavailable: "E-posta iletişimi henüz etkin değil. Form, Brevo bağlandığında açılacaktır." },
  es: { name: "Nombre", email: "Correo electrónico", topic: "Tema", general: "Consulta general", verification: "Verificación", technical: "Problema técnico", message: "Mensaje", send: "Enviar mensaje", sending: "Enviando…", sent: "Hemos recibido tu mensaje. Responderemos por correo.", failed: "No se pudo enviar el mensaje. Inténtalo más tarde.", unavailable: "El contacto por correo aún no está activo. El formulario se abrirá al conectar Brevo." },
  fr: { name: "Nom", email: "Adresse e-mail", topic: "Sujet", general: "Question générale", verification: "Vérification", technical: "Problème technique", message: "Votre message", send: "Envoyer le message", sending: "Envoi…", sent: "Votre message a été reçu. Nous vous répondrons par e-mail.", failed: "Envoi impossible. Veuillez réessayer plus tard.", unavailable: "Le contact par e-mail n'est pas encore actif. Le formulaire sera disponible une fois Brevo connecté." },
  de: { name: "Name", email: "E-Mail-Adresse", topic: "Thema", general: "Allgemeine Frage", verification: "Verifizierung", technical: "Technisches Problem", message: "Ihre Nachricht", send: "Nachricht senden", sending: "Wird gesendet…", sent: "Ihre Nachricht ist angekommen. Wir antworten per E-Mail.", failed: "Die Nachricht konnte nicht gesendet werden. Bitte später erneut versuchen.", unavailable: "E-Mail-Kontakt ist noch nicht aktiv. Das Formular wird nach der Brevo-Anbindung verfügbar." },
} satisfies Record<Locale, Record<string, string>>;

export function ContactForm({ locale, enabled }: { locale: Locale; enabled: boolean }) {
  const t = copy[locale];
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  if (!enabled) return <div className="card contact-unavailable" role="status">{t.unavailable}</div>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const form = event.currentTarget;
    const fields = new FormData(form);
    try {
      const response = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fields.entries())),
      });
      setNotice(response.ok ? t.sent : t.failed);
      if (response.ok) form.reset();
    } catch { setNotice(t.failed); }
    finally { setBusy(false); }
  }

  return <form className="card grid contact-form" onSubmit={submit}>
    <div className="form-grid two">
      <label>{t.name}<input name="name" maxLength={100} required autoComplete="name" /></label>
      <label>{t.email}<input name="email" type="email" maxLength={254} required autoComplete="email" /></label>
    </div>
    <label>{t.topic}<select name="topic"><option value="general">{t.general}</option><option value="verification">{t.verification}</option><option value="technical">{t.technical}</option></select></label>
    <label>{t.message}<textarea name="message" minLength={15} maxLength={3000} rows={6} required /></label>
    <div className="sr-file" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <button type="submit" className="btn" disabled={busy}>{busy ? t.sending : t.send}</button>
    {notice && <p role="status">{notice}</p>}
  </form>;
}
