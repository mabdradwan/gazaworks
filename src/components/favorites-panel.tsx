"use client";
import {useEffect,useState} from "react";
type Favorite={talent_id:string;created_at:string;profiles?:{id:string;display_name:string;account_type:string;avatar_path?:string}|null};
export function FavoritesPanel(){
 const [items,setItems]=useState<Favorite[]>([]),[message,setMessage]=useState("");
 async function load(){const r=await fetch("/api/favorites");if(r.ok)setItems(await r.json());else setMessage("Favorites are available to client accounts.")}
 useEffect(()=>{void load()},[]);
 async function remove(id:string){await fetch("/api/favorites?talentId="+encodeURIComponent(id),{method:"DELETE"});await load()}
 return <div className="grid">{message&&<p role="status">{message}</p>}{items.length?items.map(x=><article className="card" key={x.talent_id}><span className="badge">{x.profiles?.account_type??"talent"}</span><h2>{x.profiles?.display_name??x.talent_id}</h2><button className="btn secondary" onClick={()=>void remove(x.talent_id)}>Remove</button></article>):<div className="empty">No saved talent yet.</div>}</div>
}
