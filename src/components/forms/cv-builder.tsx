"use client";
import {FormEvent,useMemo,useState} from "react";

type CV={name:string;title:string;summary:string;experience:string;education:string;projects:string;skills:string;software:string;languages:string;training:string;certifications:string;achievements:string;goals:string};
const empty:CV={name:"",title:"",summary:"",experience:"",education:"",projects:"",skills:"",software:"",languages:"",training:"",certifications:"",achievements:"",goals:""};
const fields=(ar:boolean)=>[
  ["name",ar?"ما اسمك الكامل؟":"What is your full name?"],
  ["title",ar?"ما مهنتك أو المسمى الذي تريد الظهور به؟":"What profession or title do you want to use?"],
  ["experience",ar?"احكِ عن خبراتك السابقة: الأدوار، الجهات، المدة، والنتائج.":"Describe your experience: roles, organizations, dates and results."],
  ["education",ar?"ما تعليمك الأكاديمي؟":"What is your education?"],
  ["projects",ar?"ما أهم المشاريع التي نفذتها؟":"What are the strongest projects you have completed?"],
  ["skills",ar?"ما أهم مهاراتك المهنية؟":"What are your strongest professional skills?"],
  ["software",ar?"ما البرامج والأدوات التي تتقنها؟":"Which software and tools do you use?"],
  ["languages",ar?"ما اللغات ومستوياتها؟":"Which languages do you speak and at what level?"],
  ["training",ar?"ما التدريبات أو الدورات المهمة؟":"Which relevant trainings have you completed?"],
  ["certifications",ar?"هل لديك شهادات مهنية؟":"Do you hold professional certifications?"],
  ["achievements",ar?"ما الإنجازات التي تريد إبرازها؟":"Which achievements should stand out?"],
  ["goals",ar?"ما هدفك المهني أو نوع الفرص التي تبحث عنها؟":"What is your career goal or desired opportunity?"],
  ["summary",ar?"اكتب نبذة قصيرة عنك، أو اتركها فارغة ليقترح الذكاء الاصطناعي صياغة لاحقًا.":"Write a short summary, or leave it blank for an AI wording suggestion later."]
] as const;

export function CVBuilder({locale="en"}:{locale?:string}){
  const ar=locale==="ar",[cv,setCv]=useState<CV>(empty),[step,setStep]=useState(0),[template,setTemplate]=useState<"classic"|"modern">("classic"),[busy,setBusy]=useState(false),[suggestion,setSuggestion]=useState(""),[message,setMessage]=useState("");
  const questions=fields(ar),complete=useMemo(()=>Object.values(cv).filter(v=>v.trim()).length,[cv]);
  function set(key:keyof CV,value:string){setCv(v=>({...v,[key]:value}))}
  const [key,label]=questions[step];
  async function improve(e?:FormEvent){e?.preventDefault();setBusy(true);setMessage(ar?"جارٍ إعداد صياغة احترافية…":"Creating a professional draft…");const prompt=(ar?"أنشئ سيرة ذاتية احترافية من الحقائق التالية فقط. لا تخترع تواريخ أو جهات أو مهارات أو إنجازات. أعِد النص بلغة واضحة وبعناوين أقسام.":"Create a professional CV draft from these user-provided facts only. Do not invent dates, employers, skills or achievements. Use clear section headings.")+"\n"+JSON.stringify(cv);const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({task:"cv_builder",prompt,locale})});const d=await r.json().catch(()=>({}));setSuggestion(r.ok?d.text:"");setMessage(r.ok?(ar?"تم إنشاء اقتراح. راجعه قبل استخدامه.":"Draft suggestion created. Review it before using it."):(ar?"مزود الذكاء الاصطناعي غير مربوط حاليًا. يمكنك إكمال السيرة يدويًا وحفظها PDF.":"AI is not configured yet. You can still complete the CV manually and save it as PDF."));setBusy(false)}
  function print(){window.print()}
  const sections:[string,string][]=[
    [ar?"نبذة":"Summary",cv.summary],[ar?"الخبرة":"Experience",cv.experience],[ar?"التعليم":"Education",cv.education],[ar?"المشاريع":"Projects",cv.projects],[ar?"المهارات":"Skills",cv.skills],[ar?"الأدوات":"Software & tools",cv.software],[ar?"اللغات":"Languages",cv.languages],[ar?"التدريب":"Training",cv.training],[ar?"الشهادات":"Certifications",cv.certifications],[ar?"الإنجازات":"Achievements",cv.achievements]
  ];
  return <div className="cv-builder-layout">
    <div className="grid no-print">
      <section className="card grid">
        <div className="card-head"><div><span className="badge">{step+1}/{questions.length}</span><h2>{ar?"مقابلة إنشاء السيرة":"CV interview"}</h2></div><span className="status-chip success-chip">{complete}/{Object.keys(cv).length} {ar?"مكتمل":"complete"}</span></div>
        <p className="muted">{ar?"أجب خطوة بخطوة. تستطيع العودة وتعديل أي معلومة، ولن يتم نشر شيء دون موافقتك.":"Answer step by step. You can go back and edit anything, and nothing is published without your confirmation."}</p>
        <label>{label}{["experience","education","projects","training","achievements","summary"].includes(key)?<textarea rows={7} value={cv[key]} onChange={e=>set(key,e.target.value)}/>:<input value={cv[key]} onChange={e=>set(key,e.target.value)}/>}</label>
        <div className="form-actions"><button type="button" className="btn secondary" disabled={step===0} onClick={()=>setStep(s=>Math.max(0,s-1))}>{ar?"السابق":"Previous"}</button><button type="button" className="btn" disabled={step===questions.length-1} onClick={()=>setStep(s=>Math.min(questions.length-1,s+1))}>{ar?"التالي":"Next"}</button></div>
      </section>
      <section className="card grid"><h2>{ar?"التنسيق والمساعدة":"Template & assistance"}</h2><div className="form-grid two"><label>{ar?"قالب السيرة":"CV template"}<select value={template} onChange={e=>setTemplate(e.target.value as "classic"|"modern")}><option value="classic">{ar?"كلاسيكي نظيف":"Clean classic"}</option><option value="modern">{ar?"حديث":"Modern"}</option></select></label><label>{ar?"لغة السيرة":"CV language"}<input value={locale.toUpperCase()} disabled/></label></div><div className="form-actions"><button type="button" className="btn" disabled={busy} onClick={()=>void improve()}>{busy?(ar?"جارٍ العمل…":"Working…"):(ar?"تحسين الصياغة بالذكاء الاصطناعي":"Improve wording with AI")}</button><button type="button" className="btn secondary" onClick={print}>{ar?"حفظ / طباعة PDF":"Save / Print PDF"}</button></div><p className="muted">{ar?"عند فتح نافذة الطباعة اختر «حفظ كملف PDF».":"In the print dialog, choose “Save as PDF” for a downloadable PDF."}</p>{message&&<p role="status">{message}</p>}{suggestion&&<label>{ar?"اقتراح الذكاء الاصطناعي — للمراجعة فقط":"AI suggestion — review before use"}<textarea readOnly rows={14} value={suggestion}/></label>}</section>
    </div>

    <article className={"card cv-sheet cv-"+template} dir={ar?"rtl":"ltr"}>
      <header className="cv-header"><h1>{cv.name||(ar?"اسمك":"Your Name")}</h1><h3>{cv.title||(ar?"المسمى المهني":"Professional title")}</h3>{cv.goals&&<p className="muted">{cv.goals}</p>}</header>
      {sections.filter(([,v])=>v.trim()).map(([h,v])=><section key={h} className="cv-section"><h2>{h}</h2><div style={{whiteSpace:"pre-wrap"}}>{v}</div></section>)}
      {!sections.some(([,v])=>v.trim())&&<div className="empty">{ar?"أجب عن الأسئلة لتظهر معاينة السيرة هنا.":"Answer the interview questions to build your CV preview."}</div>}
      <footer className="muted cv-footer">Created with GazaWorks</footer>
    </article>
  </div>
}
