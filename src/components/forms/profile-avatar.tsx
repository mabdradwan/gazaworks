"use client";
import {apiFetch} from "@/lib/api-fetch";
import {useEffect,useRef,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";
import {basicWorkspaceCopy} from "@/lib/basic-workspace-copy";

export function ProfileAvatar({locale="en"}:{locale?:string}){
  const {avatar:c}=basicWorkspaceCopy(locale),input=useRef<HTMLInputElement>(null);
  const [url,setUrl]=useState<string|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  async function load(){const r=await apiFetch("/api/profile/avatar");if(r.ok){const d=await r.json();setUrl(d.url??null)}}
  useEffect(()=>{void load()},[]);
  async function upload(file:File){
    setBusy(true);setMessage(c.uploading);
    const prep=await apiFetch("/api/profile/avatar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:file.name,mimeType:file.type,sizeBytes:file.size})});
    const p=await prep.json();
    if(!prep.ok){setMessage(c.rejected);setBusy(false);return}
    const db=supabaseBrowser();const {error}=await db.storage.from("avatars").uploadToSignedUrl(p.path,p.token,file,{contentType:file.type});
    if(error){setMessage(c.rejected);setBusy(false);return}
    const save=await apiFetch("/api/profile/avatar",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:p.path})});
    setMessage(save.ok?c.updated:c.saveFailed);
    if(save.ok)await load();setBusy(false);
  }
  return <div className="card profile-avatar-card">
    <div className="avatar-preview" style={url?{backgroundImage:"url("+url+")"}:{}} aria-label={c.label}>{!url&&<span>{c.placeholder}</span>}</div>
    <div className="grid" style={{gap:8}}><h2>{c.title}</h2><p className="muted">{c.description}</p><input ref={input} className="sr-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f)}}/><button type="button" className="btn secondary" disabled={busy} onClick={()=>input.current?.click()}>{busy?c.uploading:c.choose}</button>{message&&<small role="status">{message}</small>}</div>
  </div>
}
