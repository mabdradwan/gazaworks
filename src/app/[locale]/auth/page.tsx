import { AuthForm } from "@/components/forms/auth-form";
export default async function Auth({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{mode?:string|string[];next?:string|string[];error?:string|string[]}>}) {
 const [{locale},query]=await Promise.all([params,searchParams]);
 const mode=query.mode==="register"?"register":"signin";
 const next=typeof query.next==="string"?query.next:undefined,errorCode=typeof query.error==="string"?query.error:undefined;
 return <section className="container auth-wrap"><AuthForm key={`${locale}:${mode}:${next??""}`} locale={locale} initialMode={mode} errorCode={errorCode} next={next}/></section>;
}
