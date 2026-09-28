"use client";
import {FormEvent,useState} from "react";
import {isLocale,type Locale} from "@/lib/i18n";
type Row=Record<string,unknown>;
type Props={row:Row;locale:string;patch:(body:Row)=>Promise<void>};
const labels:Record<Locale,string[]>={
 en:["Destination (private)","Transfer reference","Notes (private)","Save decision","Approve payout","Mark processing","Record completed transfer","Mark failed","Public reason","Under review","Interview required","Approve verification","Request changes","Reject","Internal verification notes","Approve message","Reject message","Redact text","Replacement text","Open attachment","Amount due"],
 ar:["جهة الصرف (خاصة)","مرجع التحويل","ملاحظات (خاصة)","حفظ القرار","اعتماد الصرف","قيد التحويل","تسجيل تحويل مكتمل","تعذّر التحويل","السبب الظاهر للمستخدم","قيد المراجعة","المقابلة مطلوبة","اعتماد التحقق","طلب تعديلات","رفض","ملاحظات التحقق الداخلية","الموافقة على الرسالة","رفض الرسالة","تنقيح النص","النص البديل","فتح المرفق","المبلغ المستحق"],
 tr:["Hedef (özel)","Transfer referansı","Notlar (özel)","Kararı kaydet","Ödemeyi onayla","İşleniyor olarak işaretle","Tamamlanan transferi kaydet","Başarısız olarak işaretle","Kullanıcıya gösterilen neden","İnceleniyor","Görüşme gerekli","Doğrulamayı onayla","Değişiklik iste","Reddet","Dahili doğrulama notları","Mesajı onayla","Mesajı reddet","Metni düzenle","Yeni metin","Eki aç","Ödenecek tutar"],
 es:["Destino (privado)","Referencia de transferencia","Notas (privadas)","Guardar decisión","Aprobar pago","Marcar en proceso","Registrar transferencia completada","Marcar fallido","Motivo público","En revisión","Entrevista requerida","Aprobar verificación","Solicitar cambios","Rechazar","Notas internas de verificación","Aprobar mensaje","Rechazar mensaje","Redactar texto","Texto de reemplazo","Abrir adjunto","Importe adeudado"],
 fr:["Destination (privée)","Référence du virement","Notes (privées)","Enregistrer la décision","Approuver le versement","Marquer en cours","Enregistrer le virement effectué","Marquer échoué","Motif public","En cours d’examen","Entretien requis","Approuver la vérification","Demander des modifications","Rejeter","Notes internes de vérification","Approuver le message","Rejeter le message","Expurger le texte","Texte de remplacement","Ouvrir la pièce jointe","Montant dû"],
 de:["Ziel (privat)","Überweisungsreferenz","Notizen (privat)","Entscheidung speichern","Auszahlung genehmigen","Als in Bearbeitung markieren","Erfolgte Überweisung erfassen","Als fehlgeschlagen markieren","Öffentliche Begründung","In Prüfung","Gespräch erforderlich","Verifizierung genehmigen","Änderungen anfordern","Ablehnen","Interne Verifizierungsnotizen","Nachricht genehmigen","Nachricht ablehnen","Text bearbeiten","Ersatztext","Anhang öffnen","Fälliger Betrag"]};
const copy=(locale:string)=>labels[isLocale(locale)?locale:"en"];
export function PayoutEditor({row,patch,locale}:Props){
 const c=copy(locale),[busy,setBusy]=useState(false);
 const [nextStatus,setNextStatus]=useState("");
 const status=String(row.status),options=status==="pending"||status==="failed"?[["approved",c[4]]]:status==="approved"?[["processing",c[5]]]:status==="processing"?[["paid",c[6]],["failed",c[7]]]:[];
 if(!options.length)return null;
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);try{await patch({id:row.id,status:f.get("status"),destination:f.get("destination"),reference:f.get("reference"),notes:f.get("notes")})}finally{setBusy(false)}}
 const transaction=row.transactions as {currency?:string}|null;
 return <form className="grid" onSubmit={submit}><strong>{c[20]}: {new Intl.NumberFormat(locale,{style:"currency",currency:transaction?.currency??"USD"}).format(Number(row.amount_minor)/100)}</strong><div className="form-grid two"><label>{c[0]}<input name="destination" maxLength={500} defaultValue={String(row.destination_private??"")} required={status==="processing"&&nextStatus!=="failed"}/></label><label>{c[1]}<input name="reference" maxLength={300} defaultValue={String(row.transfer_reference??"")} required={status==="processing"&&nextStatus!=="failed"}/></label></div><label>{c[2]}<textarea name="notes" maxLength={3000} defaultValue={String(row.notes??"")}/></label><label>{c[3]}<select name="status" onChange={e=>setNextStatus(e.target.value)}>{options.map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label><button className="btn" disabled={busy}>{c[3]}</button></form>;
}
export function VerificationEditor({row,patch,locale}:Props){
 const c=copy(locale),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);try{await patch({id:row.id,status:f.get("status"),reason:f.get("reason"),internalNotes:f.get("notes")})}finally{setBusy(false)}}
 return <form className="grid" onSubmit={submit}><label>{c[3]}<select name="status">{[["under_review",c[9]],["interview_required",c[10]],["verified",c[11]],["changes_requested",c[12]],["rejected",c[13]]].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label>{c[8]}<textarea name="reason" required minLength={10} maxLength={5000}/></label><label>{c[14]}<textarea name="notes" maxLength={5000} defaultValue={String(row.internal_notes??"")}/></label><button className="btn" disabled={busy}>{c[3]}</button></form>;
}
export function ModerationEditor({row,patch,locale}:Props){
 const c=copy(locale),[busy,setBusy]=useState(false),[decision,setDecision]=useState("approve");
 if(row.decision)return null;
 const message=row.chat_messages as {message_type?:string}|null;
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);try{await patch({id:row.id,decision,redactedBody:decision==="redact"?f.get("replacement"):undefined})}finally{setBusy(false)}}
 return <form className="grid" onSubmit={submit}>{typeof row.attachment_url==="string"&&<a className="btn secondary" href={row.attachment_url} target="_blank" rel="noreferrer">{c[19]}</a>}<label>{c[3]}<select value={decision} onChange={e=>setDecision(e.target.value)}><option value="approve">{c[15]}</option><option value="reject">{c[16]}</option>{message?.message_type==="text"&&<option value="redact">{c[17]}</option>}</select></label>{decision==="redact"&&<label>{c[18]}<textarea name="replacement" required minLength={1} maxLength={5000}/></label>}<button className="btn" disabled={busy}>{c[3]}</button></form>;
}
