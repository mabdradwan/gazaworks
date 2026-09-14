import {CVBuilder} from "@/components/forms/cv-builder";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <section className="container" style={{padding:"40px 0"}}><span className="badge">AI-assisted, user controlled</span><h1>CV Builder</h1><p className="muted">Build a professional CV, improve wording with AI, then print or save it as PDF.</p><CVBuilder locale={locale}/></section>}
