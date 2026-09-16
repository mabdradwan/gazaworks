"use client";
import {apiFetch} from "@/lib/api-fetch";
import {useEffect,useState} from "react";
type N={id:string;category:string;title:string;body:string;data?:Record<string,unknown>;read_at?:string|null;created_at:string};
export function NotificationsPanel({locale="en"}:{locale?:string}){
  const ar=locale==="ar",[items,setItems]=useState<N[]>([]);
  async function load(){const r=await apiFetch("/api/notifications");if(r.ok)setItems(await r.json())}
  useEffect(()=>{void load()},[]);
  async function read(id:string){await apiFetch("/api/notifications",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});await load()}
  const groups=items.reduce<Record<string,N[]>>((a,n)=>{(a[n.category]??=[]).push(n);return a},{});
  return <div className="grid">{items.length?Object.entries(groups).map(([category,rows])=><section className="grid" key={category}><div className="section-row"><h2>{category.replaceAll("_"," ")}</h2><span className="badge">{rows.filter(x=>!x.read_at).length} {ar?"غير مقروء":"unread"}</span></div>{rows.map(x=><article className={"card notification-card "+(!x.read_at?"unread":"")} key={x.id}><div className="card-head"><div><strong>{x.title}</strong><p>{x.body}</p></div><small>{new Date(x.created_at).toLocaleString(ar?"ar-PS":"en")}</small></div>{!x.read_at&&<button className="btn secondary" onClick={()=>void read(x.id)}>{ar?"تحديد كمقروء":"Mark as read"}</button>}</article>)}</section>):<div className="empty">{ar?"لا توجد إشعارات.":"No notifications."}</div>}</div>
}

