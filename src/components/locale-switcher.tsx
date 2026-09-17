"use client";
import Link from "next/link";
import {Suspense} from "react";
import {usePathname,useSearchParams} from "next/navigation";
import {locales,type Locale} from "@/lib/i18n";
import {localizedHref} from "@/domain/navigation";

function LanguageLinks({locale,className}:{locale:Locale;className?:string}){
  const pathname=usePathname()||`/${locale}`;
  const search=useSearchParams().toString();
  return <div className={className}>{locales.map(x=>{
    const href=localizedHref(pathname,search,x);
    return <Link key={x} href={href} aria-current={x===locale?"page":undefined}>{x.toUpperCase()}</Link>
  })}</div>;
}

export function LocaleSwitcher(props:{locale:Locale;className?:string}){
 return <Suspense fallback={null}><LanguageLinks {...props}/></Suspense>;
}
