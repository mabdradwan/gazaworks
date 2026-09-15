"use client";
import {useEffect,useRef,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";

export function ProfileAvatar({locale="en"}:{locale?:string}){
  const ar=locale==="ar",input=useRef<HTMLInputElement>(null);
  const [url,setUrl]=useState<string|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  async function load(){const r=await fetch("/api/profile/avatar");if(r.ok){const d=await r.json();setUrl(d.url??null)}}
  useEffect(()=>{void load()},[]);
  async function upload(file:File){
    setBusy(true);setMessage(ar?"جارٍ رفع الصورة…":"Uploading photo…");
    const prep=await fetch("/api/profile/avatar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:file.name,mimeType:file.type,sizeBytes:file.size})});
    const p=await prep.json();
    if(!prep.ok){setMessage(ar?"تعذّر رفع الصورة. استخدم JPG أو PNG أو WebP بحجم أقل من 10MB.":p.error??"Upload rejected.");setBusy(false);return}
    const db=supabaseBrowser();const {error}=await db.storage.from("avatars").uploadToSignedUrl(p.path,p.token,file,{contentType:file.type});
    if(error){setMessage(error.message);setBusy(false);return}
    const save=await fetch("/api/profile/avatar",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:p.path})});
    setMessage(save.ok?(ar?"تم تحديث الصورة الشخصية.":"Profile photo updated."):(ar?"تم رفع الصورة لكن تعذّر حفظها.":"Photo uploaded but could not be saved."));
    if(save.ok)await load();setBusy(false);
  }
  return <div className="card profile-avatar-card">
    <div className="avatar-preview" style={url?{backgroundImage:"url("+url+")"}:{}} aria-label={ar?"الصورة الشخصية":"Profile photo"}>{!url&&<span>{ar?"صورة":"Photo"}</span>}</div>
    <div className="grid" style={{gap:8}}><h2>{ar?"الصورة الشخصية":"Profile photo"}</h2><p className="muted">{ar?"تظهر هذه الصورة للعملاء المسجلين بعد التحقق. الحد الأقصى 10MB.":"This photo is shown to authenticated clients after verification. Maximum 10MB."}</p><input ref={input} className="sr-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f)}}/><button type="button" className="btn secondary" disabled={busy} onClick={()=>input.current?.click()}>{busy?(ar?"جارٍ الرفع…":"Uploading…"):(ar?"اختيار صورة":"Choose photo")}</button>{message&&<small role="status">{message}</small>}</div>
  </div>
}
