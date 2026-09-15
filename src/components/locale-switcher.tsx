"use client";
import Link from "next/link";
import {usePathname,useSearchParams} from "next/navigation";
import {locales,type Locale} from "@/lib/i18n";

export function LocaleSwitcher({locale,className}:{locale:Locale;className?:string}){
  const pathname=usePathname()||`/${locale}`;
  const search=useSearchParams();
  const rest=pathname.replace(/^\/(ar|en|tr|es|fr|de)(?=\/|$)/,"");
  const query=search.toString();
  return <div className={className}>{locales.map(x=>{
    const href=`/${x}${rest||""}${query?`?${query}`:""}`;
    return <Link key={x} href={href} aria-current={x===locale?"page":undefined}>{x.toUpperCase()}</Link>
  })}</div>;
}
