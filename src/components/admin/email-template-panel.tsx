"use client";
import {useCallback,useEffect,useRef,useState,type FormEvent} from "react";
import {apiFetch} from "@/lib/api-fetch";
import {emailKinds,type EmailKind} from "@/domain/email";
import {emailCopy} from "@/lib/email-copy";
import {isLocale,locales,type Locale} from "@/lib/i18n";
type Copy={title:string;kind:string;locale:string;subject:string;html:string;text:string;enabled:string;save:string;saved:string;failed:string;help:string;builtin:string};
const copy:Record<Locale,Copy>={
 en:{title:"Email templates",kind:"Notification",locale:"Language",subject:"Subject",html:"HTML body",text:"Plain-text body",enabled:"Allow this template to send",save:"Save template",saved:"Template saved.",failed:"Could not save. Check the subject and supported placeholders.",help:"Supported placeholders: {{subject}}, {{message}}, {{dashboard_url}}, {{platform_name}}. A secure account link is added automatically.",builtin:"No custom template exists for this notification and language. The localized platform template is used until you save one."},
 ar:{title:"قوالب البريد",kind:"الإشعار",locale:"اللغة",subject:"الموضوع",html:"المحتوى بصيغة HTML",text:"المحتوى النصي",enabled:"السماح بإرسال هذا القالب",save:"حفظ القالب",saved:"تم حفظ القالب.",failed:"تعذّر الحفظ. راجع الموضوع والمتغيرات المدعومة.",help:"المتغيرات المدعومة: {{subject}} و{{message}} و{{dashboard_url}} و{{platform_name}}. يُضاف رابط آمن للحساب تلقائيًا.",builtin:"لا يوجد قالب مخصص لهذا الإشعار واللغة. يُستخدم قالب المنصة المترجم حتى تحفظ قالبًا مخصصًا."},
 tr:{title:"E-posta şablonları",kind:"Bildirim",locale:"Dil",subject:"Konu",html:"HTML içeriği",text:"Düz metin",enabled:"Bu şablonun gönderimine izin ver",save:"Şablonu kaydet",saved:"Şablon kaydedildi.",failed:"Kaydedilemedi. Konuyu ve desteklenen değişkenleri kontrol edin.",help:"Desteklenen değişkenler: {{subject}}, {{message}}, {{dashboard_url}}, {{platform_name}}. Güvenli hesap bağlantısı otomatik eklenir.",builtin:"Bu bildirim ve dil için özel şablon yok. Kaydedene kadar platformun yerelleştirilmiş şablonu kullanılır."},
 es:{title:"Plantillas de correo",kind:"Aviso",locale:"Idioma",subject:"Asunto",html:"Contenido HTML",text:"Texto sin formato",enabled:"Permitir el envío de esta plantilla",save:"Guardar plantilla",saved:"Plantilla guardada.",failed:"No se pudo guardar. Revisa el asunto y las variables admitidas.",help:"Variables admitidas: {{subject}}, {{message}}, {{dashboard_url}}, {{platform_name}}. Se añade automáticamente un enlace seguro a la cuenta.",builtin:"No hay una plantilla personalizada para este aviso e idioma. Se usa la plantilla traducida de la plataforma hasta que guardes una."},
 fr:{title:"Modèles de courriels",kind:"Notification",locale:"Langue",subject:"Objet",html:"Contenu HTML",text:"Texte brut",enabled:"Autoriser l'envoi de ce modèle",save:"Enregistrer le modèle",saved:"Modèle enregistré.",failed:"Enregistrement impossible. Vérifiez l'objet et les variables prises en charge.",help:"Variables prises en charge : {{subject}}, {{message}}, {{dashboard_url}}, {{platform_name}}. Un lien sécurisé vers le compte est ajouté automatiquement.",builtin:"Aucun modèle personnalisé pour cet avis et cette langue. Le modèle traduit de la plateforme est utilisé tant que vous n'en enregistrez pas."},
 de:{title:"E-Mail-Vorlagen",kind:"Benachrichtigung",locale:"Sprache",subject:"Betreff",html:"HTML-Inhalt",text:"Reiner Text",enabled:"Versand dieser Vorlage erlauben",save:"Vorlage speichern",saved:"Vorlage gespeichert.",failed:"Speichern fehlgeschlagen. Prüfen Sie Betreff und unterstützte Platzhalter.",help:"Unterstützte Platzhalter: {{subject}}, {{message}}, {{dashboard_url}}, {{platform_name}}. Ein sicherer Kontolink wird automatisch ergänzt.",builtin:"Für diese Nachricht und Sprache gibt es keine eigene Vorlage. Bis zum Speichern wird die übersetzte Plattformvorlage verwendet."}
};
type Template={key:EmailKind;locale:Locale;subject:string;body_html:string;body_text:string|null;enabled:boolean;updated_at:string};
export function EmailTemplatePanel({locale}:{locale:string}){
 const language=isLocale(locale)?locale:"en",c=copy[language],queueCopy=emailCopy(language);
 const [kind,setKind]=useState<EmailKind>("verification_status"),[targetLocale,setTargetLocale]=useState<Locale>(language),[record,setRecord]=useState<Template|null>(null);
 const [loaded,setLoaded]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const generation=useRef(0),writing=useRef(false);
 const load=useCallback(async()=>{
  const current=++generation.current;setLoading(true);setLoaded(false);
  const response=await apiFetch("/api/admin/email-templates"),data=await response.json();
  if(current!==generation.current)return;
  if(response.ok){setRecord((data as Template[]).find(row=>row.key===kind&&row.locale===targetLocale)??null);setLoaded(true);}
  else setMessage(emailCopy(locale).loadFailed);
  setLoading(false);
 },[kind,targetLocale,locale]);
 useEffect(()=>{void load();return()=>{generation.current++;};},[load]);
 async function save(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(writing.current)return;
  writing.current=true;setBusy(true);setMessage("");const fields=new FormData(event.currentTarget);
  try{
   const response=await apiFetch("/api/admin/email-templates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:kind,locale:targetLocale,subject:fields.get("subject"),bodyHtml:fields.get("html"),bodyText:fields.get("text"),enabled:fields.get("enabled")==="on"})});
   if(response.ok)await load();setMessage(response.ok?c.saved:c.failed);
  }finally{writing.current=false;setBusy(false);}
 }
 return <section className="card grid" dir={language==="ar"?"rtl":"ltr"}>
  <div className="form-actions"><h2 style={{flex:1}}>{c.title}</h2><button className="btn secondary" disabled={busy||loading} onClick={()=>{setMessage("");void load();}}>{queueCopy.refresh}</button></div>
  <div className="form-grid two"><label>{c.kind}<select value={kind} disabled={busy} onChange={e=>{setKind(e.target.value as EmailKind);setMessage("");}}>{emailKinds.map(value=><option key={value} value={value}>{queueCopy.kinds[value]}</option>)}</select></label><label>{c.locale}<select value={targetLocale} disabled={busy} onChange={e=>{setTargetLocale(e.target.value as Locale);setMessage("");}}>{locales.map(value=><option key={value} value={value}>{new Intl.DisplayNames(language,{type:"language"}).of(value)}</option>)}</select></label></div>
  {message&&<p role="status">{message}</p>}
  {loading?<p role="status">{queueCopy.loading}</p>:loaded&&<form className="grid" onSubmit={save} key={`${kind}-${targetLocale}-${record?.updated_at??"builtin"}`}>
   {!record&&<p className="muted">{c.builtin}</p>}<p className="muted">{c.help}</p>
   <label>{c.subject}<input name="subject" maxLength={250} required defaultValue={record?.subject??"GazaWorks — {{subject}}"} dir={targetLocale==="ar"?"rtl":"ltr"}/></label>
   <label>{c.html}<textarea name="html" rows={8} maxLength={100000} required defaultValue={record?.body_html??"<h1>{{subject}}</h1><p>{{message}}</p>"} dir="ltr"/></label>
   <label>{c.text}<textarea name="text" rows={4} maxLength={100000} defaultValue={record?.body_text??"{{message}}"} dir={targetLocale==="ar"?"rtl":"ltr"}/></label>
   <label className="skill-option"><input type="checkbox" name="enabled" defaultChecked={record?.enabled??true}/><span>{c.enabled}</span></label>
   <div><button className="btn" disabled={busy||loading}>{c.save}</button></div>
  </form>}
 </section>;
}
