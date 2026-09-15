"use client";
import {FormEvent,useEffect,useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/client";

type Category={id:string;slug:string;category_translations:{locale:string;name:string}[]};
type Skill={id:string;slug:string;skill_translations:{locale:string;name:string}[]};
type RequestRow={id:string;title:string;description:string;budget_min_minor:number;budget_max_minor:number;currency:string;status:string;visibility:string;delivery_expectations?:string|null;notes?:string|null;created_at:string};

export function WorkRequestForm({locale="en"}:{locale?:string}){
  const ar=locale==="ar";
  const [message,setMessage]=useState(""),[categories,setCategories]=useState<Category[]>([]),[skills,setSkills]=useState<Skill[]>([]),[requests,setRequests]=useState<RequestRow[]>([]),[files,setFiles]=useState<File[]>([]),[busy,setBusy]=useState(false);

  const name=(translations:{locale:string;name:string}[],slug:string)=>translations.find(t=>t.locale===locale)?.name??translations.find(t=>t.locale==="en")?.name??slug;
  async function load(){
    const [t,r]=await Promise.all([fetch("/api/taxonomy"),fetch("/api/work-requests?mine=1")]);
    if(t.ok){const x=await t.json();setCategories(x.categories??[]);setSkills(x.skills??[])}
    if(r.ok)setRequests(await r.json());
  }
  useEffect(()=>{void load()},[]);

  async function uploadFiles(workRequestId:string){
    for(const file of files){
      const prep=await fetch("/api/work-requests/files",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({workRequestId,fileName:file.name,mimeType:file.type||"application/octet-stream",sizeBytes:file.size})});
      const p=await prep.json();if(!prep.ok)throw new Error(p.error??"attachment_prepare_failed");
      const db=supabaseBrowser();const {error}=await db.storage.from("work-request-files").uploadToSignedUrl(p.path,p.token,file,{contentType:file.type||"application/octet-stream"});
      if(error)throw error;
      const done=await fetch("/api/work-requests/files",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({workRequestId,path:p.path,mimeType:file.type||"application/octet-stream",sizeBytes:file.size})});
      if(!done.ok)throw new Error("attachment_record_failed");
    }
  }

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage(ar?"جارٍ نشر طلب العمل…":"Publishing work request…");
    const f=new FormData(e.currentTarget);
    const min=Math.round(Number(f.get("budgetMin"))*100),max=Math.round(Number(f.get("budgetMax"))*100);
    const r=await fetch("/api/work-requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      title:f.get("title"),description:f.get("description"),categoryId:f.get("categoryId"),
      skills:f.getAll("skills"),budgetMin:min,budgetMax:max,currency:f.get("currency"),
      visibility:f.get("visibility"),deliveryExpectations:f.get("deliveryExpectations"),notes:f.get("notes")
    })});
    const d=await r.json().catch(()=>({}));
    if(!r.ok){setMessage(ar?"تعذّر النشر. تأكد أنك داخل حساب عميل وأن الحقول صحيحة.":"Could not publish. Sign in as a client and check the fields.");setBusy(false);return}
    try{if(files.length)await uploadFiles(String(d.id));setMessage(ar?"تم نشر طلب العمل بنجاح.":"Work request published.");e.currentTarget.reset();setFiles([]);await load()}
    catch{setMessage(ar?"تم إنشاء طلب العمل، لكن تعذّر رفع أحد المرفقات. يمكنك متابعة الطلب وإعادة إضافة الملف لاحقًا.":"Work request created, but an attachment could not be uploaded.")}
    setBusy(false);
  }

  async function setStatus(id:string,status:"published"|"closed"|"cancelled"){
    const r=await fetch("/api/work-requests",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
    if(r.ok)await load();else setMessage(ar?"تعذّر تحديث حالة الطلب.":"Could not update request status.");
  }

  return <div className="grid">
    <form className="card grid" onSubmit={submit}>
      <div><h2>{ar?"إنشاء طلب عمل":"Create a work request"}</h2><p className="muted">{ar?"اشرح المهمة بوضوح حتى يتمكن المحترفون الموثقون من تقديم عروض مناسبة.":"Describe the engagement clearly so verified professionals can submit relevant offers."}</p></div>
      <label>{ar?"العنوان":"Title"}<input name="title" required minLength={5} placeholder={ar?"مثال: مونتاج 10 فيديوهات قصيرة":"e.g. Edit 10 short-form videos"}/></label>
      <label>{ar?"الوصف":"Description"}<textarea name="description" required minLength={30} rows={7}/></label>
      <label>{ar?"التصنيف":"Category"}<select name="categoryId" required><option value="">{ar?"اختر التصنيف":"Choose category"}</option>{categories.map(c=><option key={c.id} value={c.id}>{name(c.category_translations,c.slug)}</option>)}</select></label>
      <fieldset className="card"><legend>{ar?"المهارات المطلوبة":"Required skills"}</legend><div className="skill-grid">{skills.map(s=><label className="skill-option" key={s.id}><input type="checkbox" name="skills" value={s.id}/><span>{name(s.skill_translations,s.slug)}</span></label>)}</div></fieldset>
      <div className="form-grid two"><label>{ar?"الحد الأدنى للميزانية":"Minimum budget"}<input name="budgetMin" type="number" min="0.01" step="0.01" required/></label><label>{ar?"الحد الأعلى للميزانية":"Maximum budget"}<input name="budgetMax" type="number" min="0.01" step="0.01" required/></label></div>
      <label>{ar?"العملة":"Currency"}<select name="currency"><option>USD</option><option>EUR</option><option>TRY</option><option>ILS</option></select></label>
      <label>{ar?"توقعات التسليم":"Delivery expectations"}<textarea name="deliveryExpectations" rows={3} placeholder={ar?"الموعد المتوقع، مراحل التسليم، عدد المراجعات…":"Target date, milestones, revisions…"}/></label>
      <label>{ar?"ملاحظات إضافية":"Additional notes"}<textarea name="notes" rows={3}/></label>
      <label>{ar?"الظهور":"Visibility"}<select name="visibility"><option value="public">{ar?"للمواهب الموثقة ذات الصلة":"Relevant verified talent"}</option><option value="invite_only">{ar?"دعوات خاصة فقط":"Private invitations only"}</option></select></label>
      <label>{ar?"المرفقات":"Attachments"} <small className="muted">{ar?"حتى 50MB للملف الواحد":"up to 50MB each"}</small><input type="file" multiple onChange={e=>setFiles(Array.from(e.target.files??[]))}/></label>
      {files.length>0&&<div className="upload-list">{files.map(f=><small key={f.name}>{f.name} · {(f.size/1024/1024).toFixed(1)} MB</small>)}</div>}
      <button className="btn" disabled={busy}>{busy?(ar?"جارٍ النشر…":"Publishing…"):(ar?"نشر طلب العمل":"Publish work request")}</button><p role="status">{message}</p>
    </form>

    <div className="grid">
      <h2>{ar?"طلبات العمل الخاصة بك":"Your work requests"}</h2>
      {requests.length?requests.map(x=>{
        const money=new Intl.NumberFormat(ar?"ar-PS":"en",{style:"currency",currency:x.currency}).format(x.budget_min_minor/100)+" – "+new Intl.NumberFormat(ar?"ar-PS":"en",{style:"currency",currency:x.currency}).format(x.budget_max_minor/100);
        return <article className="card request-card" key={x.id}><div className="card-head"><div><span className="badge">{x.status}</span><h3>{x.title}</h3></div><strong>{money}</strong></div><p className="muted">{x.description}</p><div className="meta-grid"><span>{ar?"الظهور":"Visibility"}: {x.visibility}</span><span>{ar?"تاريخ الإنشاء":"Created"}: {new Date(x.created_at).toLocaleDateString(ar?"ar-PS":"en")}</span></div>{x.delivery_expectations&&<p><strong>{ar?"التسليم":"Delivery"}:</strong> {x.delivery_expectations}</p>}<details><summary>{ar?"الرقم المرجعي":"Reference ID"}</summary><code>{x.id}</code></details><div className="form-actions">{x.status!=="closed"&&<button className="btn secondary" onClick={()=>void setStatus(x.id,"closed")}>{ar?"إغلاق الطلب":"Close request"}</button>}{x.status!=="cancelled"&&<button className="btn secondary" onClick={()=>void setStatus(x.id,"cancelled")}>{ar?"إلغاء":"Cancel"}</button>}</div></article>
      }):<div className="empty">{ar?"لم تنشر أي طلب عمل بعد.":"You have not published any work requests yet."}</div>}
    </div>
  </div>
}
