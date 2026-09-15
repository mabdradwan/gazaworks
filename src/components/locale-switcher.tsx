"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {locales,type Locale} from "@/lib/i18n";

export function LocaleSwitcher({locale,className}:{locale:Locale;className?:string}){
  const pathname=usePathname()||`/${locale}`;
  const rest=pathname.replace(/^\/(ar|en|tr|es|fr|de)(?=\/|$)/,"");
  return <div className={className}>{locales.map(x=>{
    const href=`/${x}${rest||""}`;
    return <Link key={x} href={href} aria-current={x===locale?"page":undefined}>{x.toUpperCase()}</Link>
  })}</div>;
}
