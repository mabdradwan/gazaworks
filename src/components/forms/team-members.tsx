"use client";
import {apiFetch} from "@/lib/api-fetch";
import {FormEvent,useCallback,useEffect,useRef,useState} from "react";
import {optimizeImage} from "@/lib/image-optimization";
import {RoleSelect} from "@/components/professional/controls";
import {supabaseBrowser} from "@/lib/supabase/client";
import {workspaceFormCopy} from "@/lib/workspace-form-copy";

type Member={id:string;real_name_private?:string|null;public_name:string;professional_title:string;role:string;bio?:string|null;privacy_mode:string;skills?:string[];image_path?:string|null;image_url?:string|null};

export function TeamMembers({locale="en"}:{locale?:string}){
  const {teamMembers:c}=workspaceFormCopy(locale),[members,setMembers]=useState<Member[]>([]),[message,setMessage]=useState(""),[imagePath,setImagePath]=useState<string|null>(null),[imagePreview,setImagePreview]=useState<string|null>(null),[busy,setBusy]=useState(false),[title,setTitle]=useState(""),fileRef=useRef<HTMLInputElement>(null);
  const load=useCallback(async()=>{const r=await apiFetch("/api/team-members");if(r.ok)setMembers(await r.json());else setMessage(c.teamOnly)},[c.teamOnly]);
  useEffect(()=>{void load()},[load]);

  async function prepareImage(original:File){
    if(busy)return;setBusy(true);try{const file=await optimizeImage(original,640);
    setBusy(true);setMessage(c.uploading);
    const prep=await apiFetch("/api/team-members/upload",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:file.name,mimeType:file.type,sizeBytes:file.size})});const p=await prep.json();
    if(!prep.ok){setMessage(c.uploadFailed);setBusy(false);return}
    const db=supabaseBrowser();const {error}=await db.storage.from("avatars").uploadToSignedUrl(p.path,p.token,file,{contentType:file.type});if(error){setMessage(c.uploadFailed);setBusy(false);return}
    setImagePath(p.path);setImagePreview(previous=>{if(previous)URL.revokeObjectURL(previous);return URL.createObjectURL(file)});setMessage(c.uploaded);
    }catch{setMessage(c.uploadFailed)}finally{setBusy(false)}
  }

  async function add(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);const formEl=e.currentTarget,f=new FormData(formEl);
    const body={publicName:f.get("publicName"),realNamePrivate:f.get("realNamePrivate"),title:f.get("title"),role:f.get("role"),bio:f.get("bio"),privacyMode:f.get("privacyMode"),skills:String(f.get("skills")??"").split(",").map(x=>x.trim()).filter(Boolean),imagePath};
    const r=await apiFetch("/api/team-members",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    setMessage(r.ok?c.added:c.addFailed);
    if(r.ok){formEl.reset();setImagePath(null);if(imagePreview)URL.revokeObjectURL(imagePreview);setImagePreview(null);setTitle("");await load()}setBusy(false);
  }
  async function remove(id:string){if(!confirm(c.removeConfirm))return;await apiFetch("/api/team-members?id="+encodeURIComponent(id),{method:"DELETE"});await load()}

  const privacyLabel=(p:string)=>c.privacyModes[p as keyof typeof c.privacyModes]??p.replaceAll("_"," ");
  return <div className="grid">
    <form className="card grid" onSubmit={add}>
      <div><h2>{c.addTitle}</h2><p className="muted">{c.addBody}</p></div>
      <div className="form-grid two"><label>{c.realName} <small className="muted">{c.private}</small><input name="realNamePrivate"/></label><label>{c.publicName}<input name="publicName" required/></label></div>
      <div className="form-grid two"><div className="grid"><span>{c.professionalTitle}</span><RoleSelect locale={locale} name="title" value={title} onChange={setTitle}/></div><label>{c.teamRole}<input name="role" required/></label></div>
      <label>{c.biography}<textarea name="bio" rows={4}/></label>
      <label>{c.privacy}<select name="privacyMode"><option value="name_image">{c.privacyModes.name_image}</option><option value="name_only">{c.privacyModes.name_only}</option><option value="alias">{c.privacyModes.alias}</option><option value="anonymous">{c.privacyModes.anonymous}</option></select></label>
      <div className="profile-avatar-card"><div className="avatar-preview" style={imagePreview?{backgroundImage:"url("+imagePreview+")"}:{}}>{!imagePreview&&c.photo}</div><div><input ref={fileRef} className="sr-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)void prepareImage(f)}}/><button type="button" className="btn secondary" disabled={busy} onClick={()=>fileRef.current?.click()}>{c.choosePhoto}</button></div></div>
      <button className="btn" disabled={busy}>{c.addMember}</button><p role="status">{message}</p>
    </form>
    <div className="card"><h2>{c.currentTeam}</h2>{members.length?<div className="member-grid">{members.map(m=><article className="member-card" key={m.id}><div className="talent-mini-avatar" style={m.image_url?{backgroundImage:"url("+m.image_url+")"}:{}}>{!m.image_url&&m.public_name?.slice(0,1)}</div><strong>{m.public_name}</strong><span>{m.professional_title}</span><small className="muted">{m.role} · {privacyLabel(m.privacy_mode)}</small>{m.skills?.length?<div className="tag-list">{m.skills.map(s=><span className="tag" key={s}>{s}</span>)}</div>:null}{m.bio&&<p>{m.bio}</p>}<button className="btn secondary" onClick={()=>void remove(m.id)}>{c.remove}</button></article>)}</div>:<div className="empty">{c.empty}</div>}</div>
  </div>
}
