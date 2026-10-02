import {CVBuilder} from "@/components/forms/cv-builder";
import {cvCopy} from "@/lib/cv-copy";
export default async function Page({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params,c=cvCopy(locale);
 return <section className="container" style={{padding:"40px 0"}}><h1 className="no-print">{c.title}</h1><CVBuilder locale={locale}/></section>;
}
