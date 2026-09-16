"use client";
import {apiFetch} from "@/lib/api-fetch";
import {useEffect,useState} from "react";
type Article={id:string;slug:string;published_at:string|null;translation:{title:string;excerpt?:string;body:string}|null};
export function BlogList({locale}:{locale:string}){
 const [items,setItems]=useState<Article[]>([]),[loading,setLoading]=useState(true);
 useEffect(()=>{void apiFetch("/api/articles?locale="+encodeURIComponent(locale)).then(async r=>{if(r.ok)setItems(await r.json());setLoading(false)})},[locale]);
 if(loading)return <div className="empty">Loading articles…</div>;
 return <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))"}}>{items.length?items.map(a=><article className="card" key={a.id}><span className="badge">{a.published_at?new Date(a.published_at).toLocaleDateString(locale):"GazaWorks"}</span><h2>{a.translation?.title??a.slug}</h2><p className="muted">{a.translation?.excerpt??a.translation?.body?.slice(0,240)}</p></article>):<div className="empty">No articles published yet.</div>}</div>
}

