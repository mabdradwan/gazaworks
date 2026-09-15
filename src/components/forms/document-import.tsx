"use client";
import {FormEvent,useRef,useState} from "react";
export function DocumentImport({kind="individual",locale="en"}:{kind?:"individual"|"team";locale?:string}){
  const ar=locale==="ar",input=useRef<HTMLInputElement>(null);
  const [busy,setBusy]=useState(false),[fileName,setFileName]=useState(""),[result,setResult]=useState<{text?:string;aiDraft?:string;error?:string}|null>(null);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setResult(null);const f=new FormData(e.currentTarget);f.set("kind",kind);f.set("locale",locale);const r=await fetch("/api/documents/extract",{method:"POST",body:f});const data=await r.json();setResult(r.ok?data:{error:data.error??(ar?"تعذّر معالجة الملف":"Could not process document")});setBusy(false)}
  return <form className="card grid" onSubmit={submit}>
    <div><h2>{kind==="team"?(ar?"استيراد ملف الفريق":"Import team profile"):(ar?"استيراد السيرة الذاتية":"Import CV")}</h2><p className="muted">{ar?"ارفع ملف PDF أو DOCX. يستخرج GazaWorks النص ويحفظ المصدر بشكل خاص وينشئ مسودة قابلة للتعديل بمساعدة الذكاء الاصطناعي.":"Upload a PDF or DOCX. GazaWorks extracts the text, stores the source privately, and creates an editable AI-assisted draft."}</p></div>
    <label>{ar?"ملف PDF أو DOCX":"PDF or DOCX"}<input ref={input} className="sr-file" name="file" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required onChange={e=>setFileName(e.target.files?.[0]?.name??"")}/><button type="button" className="file-picker" onClick={()=>input.current?.click()}>{fileName||(ar?"اختر ملفًا":"Choose file")}</button></label>
    <button className="btn" disabled={busy}>{busy?(ar?"جارٍ المعالجة…":"Processing…"):(ar?"استيراد الملف":"Import document")}</button>
    {result?.error&&<div className="error">{result.error}</div>}
    {result?.aiDraft&&<div className="grid"><label>{ar?"مسودة بمساعدة الذكاء الاصطناعي":"AI-assisted draft"}<textarea value={result.aiDraft} readOnly rows={14}/></label><details><summary>{ar?"النص المستخرج من المصدر":"Extracted source text"}</summary><pre style={{whiteSpace:"pre-wrap",maxHeight:320,overflow:"auto"}}>{result.text}</pre></details><p className="muted">{ar?"لن يُنشر أي شيء تلقائيًا. راجع المسودة وعدّلها داخل ملفك قبل الحفظ.":"Nothing is published automatically. Copy or edit the draft in your profile before saving."}</p></div>}
  </form>
}