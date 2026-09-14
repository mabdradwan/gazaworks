"use client";
import {FormEvent,useMemo,useState} from "react";

type CV={name:string;title:string;summary:string;experience:string;education:string;skills:string;languages:string;certifications:string;projects:string};

const empty:CV={name:"",title:"",summary:"",experience:"",education:"",skills:"",languages:"",certifications:"",projects:""};

export function CVBuilder({locale="en"}:{locale?:string}){
  const [cv,setCv]=useState<CV>(empty),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const complete=useMemo(()=>Object.values(cv).filter(Boolean).length,[cv]);
  function set<K extends keyof CV>(key:K,value:CV[K]){setCv(v=>({...v,[key]:value}))}
  async function improve(e:FormEvent){
    e.preventDefault();setBusy(true);setMessage("Improving your CV…");
    const prompt=`Create a professional CV draft from the following user-provided facts. Keep facts accurate. Use clear section headings and do not invent dates, employers, skills or achievements.\n${JSON.stringify(cv)}`;
    const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({task:"cv_builder",prompt,locale})});
    const data=await r.json();setMessage(r.ok?data.text:"AI is not configured yet. You can still edit and print the CV manually.");setBusy(false);
  }
  function print(){window.print()}
  return <div className="grid" style={{gridTemplateColumns:"minmax(280px,.9fr) minmax(320px,1.1fr)",alignItems:"start"}}>
    <form className="card grid no-print" onSubmit={improve}>
      <div><span className="badge">{complete}/9 sections</span><h2>AI CV Builder</h2><p className="muted">Fill in facts only. You remain in control of every field.</p></div>
      <label>Name<input value={cv.name} onChange={e=>set("name",e.target.value)}/></label>
      <label>Professional title<input value={cv.title} onChange={e=>set("title",e.target.value)}/></label>
      <label>Professional summary<textarea rows={4} value={cv.summary} onChange={e=>set("summary",e.target.value)}/></label>
      <label>Experience<textarea rows={6} value={cv.experience} onChange={e=>set("experience",e.target.value)} placeholder="Role — Organization — Dates — Results"/></label>
      <label>Education<textarea rows={4} value={cv.education} onChange={e=>set("education",e.target.value)}/></label>
      <label>Skills<textarea rows={3} value={cv.skills} onChange={e=>set("skills",e.target.value)}/></label>
      <label>Languages<textarea rows={2} value={cv.languages} onChange={e=>set("languages",e.target.value)}/></label>
      <label>Certifications<textarea rows={3} value={cv.certifications} onChange={e=>set("certifications",e.target.value)}/></label>
      <label>Projects<textarea rows={4} value={cv.projects} onChange={e=>set("projects",e.target.value)}/></label>
      <div className="form-actions"><button className="btn" disabled={busy}>{busy?"Working…":"Improve wording with AI"}</button><button className="btn secondary" type="button" onClick={print}>Download / Print PDF</button></div>
      {message&&<label>AI suggestion<textarea readOnly rows={10} value={message}/></label>}
    </form>
    <article className="card cv-sheet">
      <header><h1 style={{marginBottom:4}}>{cv.name||"Your Name"}</h1><h3 className="muted" style={{marginTop:0}}>{cv.title||"Professional title"}</h3></header>
      {[["Summary",cv.summary],["Experience",cv.experience],["Education",cv.education],["Skills",cv.skills],["Languages",cv.languages],["Certifications",cv.certifications],["Projects",cv.projects]].map(([h,v])=><section key={h} style={{marginTop:20}}><h2>{h}</h2><div style={{whiteSpace:"pre-wrap"}}>{v||"—"}</div></section>)}
      <footer className="muted" style={{marginTop:32,fontSize:12}}>Created with GazaWorks</footer>
    </article>
  </div>
}
