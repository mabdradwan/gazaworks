"use client";
import {apiFetch} from "@/lib/api-fetch";
import Link from "next/link";
import {useEffect,useState} from "react";
type Favorite={talent_id:string;created_at:string;profiles?:{id:string;display_name:string;account_type:string;avatar_path?:string}|null};
export function FavoritesPanel({locale="en"}:{locale?:string}){
 const ar=locale==="ar",[items,setItems]=useState<Favorite[]>([]),[message,setMessage]=useState("");
 async function load(){const r=await apiFetch("/api/favorites");if(r.ok)setItems(await r.json());else setMessage(ar?"المفضلة متاحة لحسابات العملاء فقط.":"Favorites are available to client accounts.")}
 useEffect(()=>{void load()},[]);
 async function remove(id:string){const r=await apiFetch("/api/favorites?talentId="+encodeURIComponent(id),{method:"DELETE"});if(r.ok)await load()}
 return <div className="talent-grid">{message&&<p role="status">{message}</p>}{items.length?items.map(x=><article className="card" key={x.talent_id}><span className="badge">{x.profiles?.account_type==="team"?(ar?"فريق":"team"):(ar?"محترف":"individual")}</span><h2>{x.profiles?.display_name??x.talent_id}</h2><small className="muted">{ar?"حُفظ في":"Saved"} {new Date(x.created_at).toLocaleDateString(ar?"ar-PS":"en")}</small><div className="form-actions"><Link className="btn" href={"/"+locale+"/talent/"+x.talent_id}>{ar?"عرض الملف":"View profile"}</Link><button className="btn secondary" onClick={()=>void remove(x.talent_id)}>{ar?"إزالة":"Remove"}</button></div></article>):<div className="empty">{ar?"لا توجد مواهب محفوظة بعد.":"No saved talent yet."}</div>}</div>
}

