"use client";
import {apiFetch} from "@/lib/api-fetch";
import Link from "next/link";
import {useCallback,useEffect,useState} from "react";
import {basicWorkspaceCopy} from "@/lib/basic-workspace-copy";
type Favorite={talent_id:string;created_at:string;profiles?:{id:string;display_name:string;account_type:string;avatar_path?:string}|null};
export function FavoritesPanel({locale="en"}:{locale?:string}){
 const {favorites:c,language}=basicWorkspaceCopy(locale),[items,setItems]=useState<Favorite[]>([]),[message,setMessage]=useState("");
 const load=useCallback(async()=>{const r=await apiFetch("/api/favorites");if(r.ok)setItems(await r.json());else setMessage(c.accountOnly)},[c.accountOnly]);
 useEffect(()=>{void load()},[load]);
 async function remove(id:string){const r=await apiFetch("/api/favorites?talentId="+encodeURIComponent(id),{method:"DELETE"});if(r.ok)await load()}
 return <div className="talent-grid">{message&&<p role="status">{message}</p>}{items.length?items.map(x=><article className="card" key={x.talent_id}><span className="badge">{x.profiles?.account_type==="team"?c.team:c.individual}</span><h2>{x.profiles?.display_name??x.talent_id}</h2><small className="muted">{c.saved} {new Date(x.created_at).toLocaleDateString(language)}</small><div className="form-actions"><Link className="btn" href={"/"+language+"/talent/"+x.talent_id}>{c.view}</Link><button className="btn secondary" onClick={()=>void remove(x.talent_id)}>{c.remove}</button></div></article>):<div className="empty">{c.empty}</div>}</div>
}
