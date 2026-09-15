"use client";
import {FormEvent,useEffect,useRef,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";

type Member={id:string;real_name_private?:string|null;public_name:string;professional_title:string;role:string;bio?:string|null;privacy_mode:string;skills?:string[];image_path?:string|null;image_url?:string|null};

export function TeamMembers({locale="en"}:{locale?:string}){
  const ar=locale==="ar",[members,setMembers]=useState<Member[]>([]),[message,setMessage]=useState(""),[imagePath,setImagePath]=useState<string|null>(null),[imagePreview,setImagePreview]=useState<string|null>(null),[busy,setBusy]=useState(false),fileRef=useRef<HTMLInputElement>(null);
  async function load(){const r=await fetch("/api/team-members");if(r.ok)setMembers(await r.json());else setMessage(ar?"هذه الصفحة متاحة لحسابات الفرق فقط.":"This page is available to team accounts only.")}
  useEffect(()=>{void load()},[]);

  async function prepareImage(file:File){
    setBusy(true);setMessage(ar?"جارٍ رفع صورة العضو…":"Uploading member image…");
    const prep=await fetch("/api/team-members/upload",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:file.name,mimeType:file.type,sizeBytes:file.size})});const p=await prep.json();
    if(!prep.ok){setMessage(ar?"تعذّر رفع الصورة.":"Image upload failed.");setBusy(false);return}
    const db=supabaseBrowser();const {error}=await db.storage.from("avatars").uploadToSignedUrl(p.path,p.token,file,{contentType:file.type});if(error){setMessage(error.message);setBusy(false);return}
    setImagePath(p.path);setImagePreview(URL.createObjectURL(file));setMessage(ar?"تم رفع الصورة وستُربط بالعضو عند الحفظ.":"Image uploaded and will be linked when you save the member.");setBusy(false);
  }

  async function add(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);const f=new FormData(e.currentTarget);
    const body={publicName:f.get("publicName"),realNamePrivate:f.get("realNamePrivate"),title:f.get("title"),role:f.get("role"),bio:f.get("bio"),privacyMode:f.get("privacyMode"),skills:String(f.get("skills")??"").split(",").map(x=>x.trim()).filter(Boolean),imagePath};
    const r=await fetch("/api/team-members",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    setMessage(r.ok?(ar?"تمت إضافة عضو الفريق.":"Team member added."):(ar?"تعذّر إضافة العضو.":"Unable to add member."));
    if(r.ok){e.currentTarget.reset();setImagePath(null);setImagePreview(null);await load()}setBusy(false);
  }
  async function remove(id:string){if(!confirm(ar?"إزالة هذا العضو من ملف الفريق؟":"Remove this team member?"))return;await fetch("/api/team-members?id="+encodeURIComponent(id),{method:"DELETE"});await load()}

  const privacyLabel=(p:string)=>ar?({name_image:"الاسم الحقيقي والصورة",name_only:"الاسم الحقيقي بدون صورة",alias:"اسم مهني مستعار",anonymous:"صورة رمزية مجهولة"}[p]??p):p.replaceAll("_"," ");
  return <div className="grid">
    <form className="card grid" onSubmit={add}>
      <div><h2>{ar?"إضافة عضو فريق":"Add a team member"}</h2><p className="muted">{ar?"يمكن التحكم في طريقة ظهور كل عضو للعملاء. يحتفظ فريق GazaWorks بالهوية الحقيقية داخليًا عند الحاجة للتحقق.":"Control how every member appears to clients. GazaWorks can retain the real identity privately when verification requires it."}</p></div>
      <div className="form-grid two"><label>{ar?"الاسم الحقيقي":"Real name"} <small className="muted">{ar?"خاص":"Private"}</small><input name="realNamePrivate"/></label><label>{ar?"الاسم العام أو المستعار":"Public name or alias"}<input name="publicName" required/></label></div>
      <div className="form-grid two"><label>{ar?"المسمى المهني":"Professional title"}<input name="title" required/></label><label>{ar?"الدور في الفريق":"Team role"}<input name="role" required/></label></div>
      <label>{ar?"المهارات":"Skills"} <small className="muted">{ar?"افصل بينها بفاصلة":"comma separated"}</small><input name="skills" placeholder={ar?"تصميم، React، مونتاج":"Design, React, Video editing"}/></label>
      <label>{ar?"نبذة":"Biography"}<textarea name="bio" rows={4}/></label>
      <label>{ar?"خصوصية الظهور":"Privacy"}<select name="privacyMode"><option value="name_image">{ar?"الاسم الحقيقي + الصورة":"Real name and image"}</option><option value="name_only">{ar?"الاسم الحقيقي بدون صورة":"Real name without image"}</option><option value="alias">{ar?"اسم مهني مستعار":"Professional alias"}</option><option value="anonymous">{ar?"صورة رمزية مجهولة":"Anonymous avatar"}</option></select></label>
      <div className="profile-avatar-card"><div className="avatar-preview" style={imagePreview?{backgroundImage:"url("+imagePreview+")"}:{}}>{!imagePreview&&(ar?"صورة":"Photo")}</div><div><input ref={fileRef} className="sr-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)void prepareImage(f)}}/><button type="button" className="btn secondary" disabled={busy} onClick={()=>fileRef.current?.click()}>{ar?"اختيار صورة العضو":"Choose member image"}</button></div></div>
      <button className="btn" disabled={busy}>{ar?"إضافة العضو":"Add member"}</button><p role="status">{message}</p>
    </form>
    <div className="card"><h2>{ar?"الفريق الحالي":"Current team"}</h2>{members.length?<div className="member-grid">{members.map(m=><article className="member-card" key={m.id}><div className="talent-mini-avatar" style={m.image_url?{backgroundImage:"url("+m.image_url+")"}:{}}>{!m.image_url&&m.public_name?.slice(0,1)}</div><strong>{m.public_name}</strong><span>{m.professional_title}</span><small className="muted">{m.role} · {privacyLabel(m.privacy_mode)}</small>{m.skills?.length?<div className="tag-list">{m.skills.map(s=><span className="tag" key={s}>{s}</span>)}</div>:null}{m.bio&&<p>{m.bio}</p>}<button className="btn secondary" onClick={()=>void remove(m.id)}>{ar?"إزالة":"Remove"}</button></article>)}</div>:<div className="empty">{ar?"لم تتم إضافة أعضاء بعد.":"No team members added yet."}</div>}</div>
  </div>
}
