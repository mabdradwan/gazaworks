"use client";
import {FormEvent,useEffect,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";

type Translation={locale:string;name:string};
type Category={id:string;slug:string;category_translations:Translation[]};
type Skill={id:string;slug:string;skill_translations:Translation[]};
type Media={id:string;storage_path:string;mime_type:string;media_type:"image"|"video";url?:string|null};
type Portfolio={id:string;title:string;description?:string|null;completed_on?:string|null;category_id?:string|null;portfolio_skills?:{skill_id:string}[];portfolio_media?:Media[]};

export function PortfolioPanel({locale="en"}:{locale?:string}){
  const ar=locale==="ar",[items,setItems]=useState<Portfolio[]>([]),[categories,setCategories]=useState<Category[]>([]),[skills,setSkills]=useState<Skill[]>([]),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  const tr=(xs:Translation[],slug:string)=>xs.find(x=>x.locale===locale)?.name??xs.find(x=>x.locale==="en")?.name??slug;
  async function load(){const [p,t]=await Promise.all([fetch("/api/portfolio"),fetch("/api/taxonomy")]);if(p.ok)setItems(await p.json());if(t.ok){const d=await t.json();setCategories(d.categories??[]);setSkills(d.skills??[])}}
  useEffect(()=>{void load()},[]);

  async function create(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);const f=new FormData(e.currentTarget);const r=await fetch("/api/portfolio",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:f.get("title"),description:f.get("description"),categoryId:f.get("categoryId")||null,completedOn:f.get("completedOn")||null,skillIds:f.getAll("skillIds")})});setMessage(r.ok?(ar?"تمت إضافة مشروع إلى معرض الأعمال.":"Portfolio project added."):(ar?"تعذّر إنشاء المشروع.":"Could not create portfolio project."));if(r.ok){e.currentTarget.reset();await load()}setBusy(false)}

  async function update(e:FormEvent<HTMLFormElement>,id:string){e.preventDefault();const f=new FormData(e.currentTarget);const r=await fetch("/api/portfolio",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,title:f.get("title"),description:f.get("description"),categoryId:f.get("categoryId")||null,completedOn:f.get("completedOn")||null,skillIds:f.getAll("skillIds")})});setMessage(r.ok?(ar?"تم تحديث المشروع.":"Portfolio project updated."):(ar?"تعذّر التحديث.":"Update failed."));if(r.ok)await load()}

  async function remove(id:string){if(!confirm(ar?"حذف هذا المشروع وكل وسائطه؟":"Delete this portfolio project and its media?"))return;const r=await fetch("/api/portfolio?id="+encodeURIComponent(id),{method:"DELETE"});setMessage(r.ok?(ar?"تم الحذف.":"Deleted."):(ar?"تعذّر الحذف.":"Delete failed."));if(r.ok)await load()}

  async function upload(portfolioId:string,file:File){
    setMessage(ar?"جارٍ تجهيز الرفع…":"Preparing upload…");
    const prep=await fetch("/api/portfolio/upload",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({portfolioId,fileName:file.name,mimeType:file.type,sizeBytes:file.size})});const p=await prep.json();
    if(!prep.ok){setMessage(p.error==="portfolio_limit_reached"?(ar?"وصلت إلى الحد المسموح للصور أو الفيديوهات في هذا المشروع.":"Portfolio media limit reached."):(ar?"تم رفض الملف.":"Upload rejected."));return}
    const db=supabaseBrowser();const {error}=await db.storage.from("portfolio").uploadToSignedUrl(p.path,p.token,file,{contentType:file.type});if(error){setMessage(error.message);return}
    const save=await fetch("/api/portfolio/upload",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({portfolioId,path:p.path,mimeType:file.type,sizeBytes:file.size,mediaType:p.mediaType})});
    setMessage(save.ok?(ar?"تم رفع الوسائط.":"Media uploaded."):(ar?"تم الرفع لكن تعذّر حفظ سجل الوسائط.":"Upload completed but media record could not be saved."));if(save.ok)await load();
  }

  return <div className="grid">
    <form className="card grid" onSubmit={create}>
      <div><h2>{ar?"إضافة مشروع":"Add portfolio project"}</h2><p className="muted">{ar?"يتم استضافة الأعمال داخل GazaWorks. الحد الافتراضي 6 صور و3 فيديوهات لكل مشروع.":"Portfolio work is hosted inside GazaWorks. Default limit: 6 images and 3 videos per project."}</p></div>
      <div className="form-grid two"><label>{ar?"العنوان":"Title"}<input name="title" required minLength={2}/></label><label>{ar?"تاريخ الإنجاز":"Completion date"}<input type="date" name="completedOn"/></label></div>
      <label>{ar?"الوصف":"Description"}<textarea name="description" rows={4}/></label>
      <label>{ar?"التصنيف":"Category"}<select name="categoryId"><option value="">{ar?"بدون تصنيف":"No category"}</option>{categories.map(c=><option key={c.id} value={c.id}>{tr(c.category_translations,c.slug)}</option>)}</select></label>
      <fieldset className="card"><legend>{ar?"المهارات المستخدمة":"Skills used"}</legend><div className="skill-grid">{skills.map(s=><label className="skill-option" key={s.id}><input type="checkbox" name="skillIds" value={s.id}/><span>{tr(s.skill_translations,s.slug)}</span></label>)}</div></fieldset>
      <button className="btn" disabled={busy}>{busy?(ar?"جارٍ الإضافة…":"Adding…"):(ar?"إضافة إلى معرض الأعمال":"Add project")}</button>
      {message&&<p role="status">{message}</p>}
    </form>

    {items.length?items.map(item=>{
      const selected=new Set((item.portfolio_skills??[]).map(x=>x.skill_id));
      return <article className="card grid portfolio-editor" key={item.id}>
        <div className="card-head"><div><span className="badge">{item.completed_on?new Date(item.completed_on).toLocaleDateString(ar?"ar-PS":"en"):(ar?"مشروع":"Project")}</span><h2>{item.title}</h2><p className="muted">{item.description}</p></div><button className="btn secondary" onClick={()=>void remove(item.id)}>{ar?"حذف":"Delete"}</button></div>
        {item.portfolio_media?.length?<div className="portfolio-media-grid">{item.portfolio_media.map(m=>m.media_type==="image"&&m.url?<a className="media-thumb" key={m.id} href={m.url} target="_blank" rel="noreferrer" style={{backgroundImage:"url("+m.url+")"}}/>:m.url?<a className="video-link" key={m.id} href={m.url} target="_blank" rel="noreferrer">▶ {ar?"عرض الفيديو":"View video"}</a>:null)}</div>:<div className="empty">{ar?"لا توجد وسائط بعد.":"No media yet."}</div>}
        <label>{ar?"إضافة صورة أو فيديو":"Add image or video"}<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={e=>{const file=e.target.files?.[0];if(file)void upload(item.id,file)}}/></label>
        <details><summary>{ar?"تعديل تفاصيل المشروع":"Edit project details"}</summary><form className="grid" onSubmit={e=>void update(e,item.id)} style={{marginTop:12}}>
          <div className="form-grid two"><label>{ar?"العنوان":"Title"}<input name="title" required defaultValue={item.title}/></label><label>{ar?"تاريخ الإنجاز":"Completion date"}<input name="completedOn" type="date" defaultValue={item.completed_on??""}/></label></div>
          <label>{ar?"الوصف":"Description"}<textarea name="description" rows={4} defaultValue={item.description??""}/></label>
          <label>{ar?"التصنيف":"Category"}<select name="categoryId" defaultValue={item.category_id??""}><option value="">{ar?"بدون تصنيف":"No category"}</option>{categories.map(c=><option key={c.id} value={c.id}>{tr(c.category_translations,c.slug)}</option>)}</select></label>
          <div className="skill-grid">{skills.map(s=><label className="skill-option" key={s.id}><input type="checkbox" name="skillIds" value={s.id} defaultChecked={selected.has(s.id)}/><span>{tr(s.skill_translations,s.slug)}</span></label>)}</div>
          <button className="btn">{ar?"حفظ التعديلات":"Save changes"}</button>
        </form></details>
      </article>
    }):<div className="empty">{ar?"لا توجد مشاريع في معرض الأعمال بعد.":"No portfolio projects yet."}</div>}
  </div>
}
