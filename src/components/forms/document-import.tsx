"use client";
import {FormEvent,useState} from "react";

export function DocumentImport({kind="individual",locale="en"}:{kind?:"individual"|"team";locale?:string}){
  const [busy,setBusy]=useState(false),[result,setResult]=useState<{text?:string;aiDraft?:string;error?:string}|null>(null);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setResult(null);
    const f=new FormData(e.currentTarget);f.set("kind",kind);f.set("locale",locale);
    const r=await fetch("/api/documents/extract",{method:"POST",body:f});
    const data=await r.json();
    setResult(r.ok?data:{error:data.error??"Could not process document"});
    setBusy(false);
  }
  return <form className="card grid" onSubmit={submit}>
    <div><h2>{kind==="team"?"Import team profile":"Import CV"}</h2><p className="muted">Upload a PDF or DOCX. GazaWorks extracts the text, stores the source privately, and creates an editable AI-assisted draft.</p></div>
    <label>PDF or DOCX<input name="file" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required/></label>
    <button className="btn" disabled={busy}>{busy?"Processing…":"Import document"}</button>
    {result?.error&&<div className="error">{result.error}</div>}
    {result?.aiDraft&&<div className="grid"><label>AI-assisted draft<textarea value={result.aiDraft} readOnly rows={14}/></label><details><summary>Extracted source text</summary><pre style={{whiteSpace:"pre-wrap",maxHeight:320,overflow:"auto"}}>{result.text}</pre></details><p className="muted">Nothing is published automatically. Copy or edit the draft in your profile before saving.</p></div>}
  </form>
}
