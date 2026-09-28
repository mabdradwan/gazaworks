"use client";
import {apiFetch} from "@/lib/api-fetch";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {isLocale,type Locale} from "@/lib/i18n";
import {appointmentCopy,appointmentState,appointmentTime} from "@/lib/appointment-copy";
type N={id:string;category:string;title:string;body:string;data?:Record<string,unknown>;read_at?:string|null;created_at:string};
const text:Record<Locale,{unread:string;read:string;empty:string;failed:string}>={
 en:{unread:"unread",read:"Mark as read",empty:"No notifications.",failed:"Could not update notifications. Try again."},
 ar:{unread:"غير مقروء",read:"تحديد كمقروء",empty:"لا توجد إشعارات.",failed:"تعذّر تحديث الإشعارات. حاول مجددًا."},
 tr:{unread:"okunmamış",read:"Okundu olarak işaretle",empty:"Bildirim yok.",failed:"Bildirimler güncellenemedi. Tekrar deneyin."},
 es:{unread:"sin leer",read:"Marcar como leída",empty:"No hay notificaciones.",failed:"No se pudieron actualizar las notificaciones. Inténtalo de nuevo."},
 fr:{unread:"non lus",read:"Marquer comme lu",empty:"Aucune notification.",failed:"Impossible de mettre à jour les notifications. Réessayez."},
 de:{unread:"ungelesen",read:"Als gelesen markieren",empty:"Keine Benachrichtigungen.",failed:"Benachrichtigungen konnten nicht aktualisiert werden. Erneut versuchen."}
};
export function NotificationsPanel({locale="en"}:{locale?:string}){
 const language=isLocale(locale)?locale:"en",c=text[language],a=appointmentCopy(language),[items,setItems]=useState<N[]>([]),[message,setMessage]=useState(""),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{const r=await apiFetch("/api/notifications");if(r.ok)setItems(await r.json());else setMessage(text[language].failed);setLoading(false);},[language]);
 useEffect(()=>{void load();},[load]);
 async function read(id:string){setBusy(true);setMessage("");try{const r=await apiFetch("/api/notifications",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});if(!r.ok)setMessage(c.failed);else await load();}finally{setBusy(false);}}
 const groups=items.reduce<Record<string,N[]>>((all,n)=>{(all[n.category]??=[]).push(n);return all;},{});
 return <div className="grid">{message&&<p role="status">{message}</p>}{loading?<p role="status">{a.loading}</p>:items.length?Object.entries(groups).map(([category,rows])=><section className="grid" key={category}>
  <div className="section-row"><h2>{category==="appointments"?a.title:category.replaceAll("_"," ")}</h2><span className="badge">{rows.filter(x=>!x.read_at).length} {c.unread}</span></div>
  {rows.map(x=>{
   const appointment=x.category==="appointments"&&typeof x.data?.event==="string"&&x.data.event.startsWith("appointment_");
   const start=x.data?.starts_at,validStart=typeof start==="string"&&Number.isFinite(Date.parse(start));
   return <article className={"card notification-card "+(!x.read_at?"unread":"")} key={x.id}>
    <div className="card-head"><div><strong>{appointment?a.title:x.title}</strong>{appointment?<><p>{typeof x.data?.status==="string"?appointmentState(locale,x.data.status):""}{validStart?" · "+appointmentTime(locale,start):""}</p><Link href={`/${language}/dashboard/appointments`}>{a.myBookings}</Link></>:<p>{x.body}</p>}</div><small>{new Date(x.created_at).toLocaleString(language)}</small></div>
    {!x.read_at&&<button className="btn secondary" disabled={busy} onClick={()=>void read(x.id)}>{c.read}</button>}
   </article>;
  })}
 </section>):<div className="empty">{c.empty}</div>}</div>;
}
