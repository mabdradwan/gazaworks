"use client";
import Link from "next/link";
import {Suspense} from "react";
import {Check,ChevronDown,Globe2} from "lucide-react";
import {usePathname,useSearchParams} from "next/navigation";
import {locales,type Locale} from "@/lib/i18n";
import {publicCopy} from "@/lib/public-copy";
import {localizedHref} from "@/domain/navigation";
import {NavigationDisclosure} from "@/components/navigation-disclosure";
const names:Record<Locale,string>={ar:"العربية",en:"English",tr:"Türkçe",es:"Español",fr:"Français",de:"Deutsch"};
function SelectedLanguage({locale}:{locale:Locale}){
 return <><Globe2 size={18} aria-hidden="true"/><span lang={locale} dir={locale==="ar"?"rtl":"ltr"}>{names[locale]}</span><ChevronDown className="language-chevron" size={14} aria-hidden="true"/></>;
}
function LanguageLinks({locale,className}:{locale:Locale;className?:string}){
 const pathname=usePathname()||`/${locale}`;
 const search=useSearchParams().toString();
 return <NavigationDisclosure key={pathname+search} className={`language-picker ${className??""}`} label={`${publicCopy(locale).language}: ${names[locale]}`} summary={<SelectedLanguage locale={locale}/>}>
  <nav className="language-panel" aria-label={publicCopy(locale).language}>{locales.map(language=><Link key={language} href={localizedHref(pathname,search,language)} hrefLang={language} lang={language} dir={language==="ar"?"rtl":"ltr"} aria-current={language===locale?"page":undefined}><span>{names[language]}</span>{language===locale&&<Check size={16} aria-hidden="true"/>}</Link>)}</nav>
 </NavigationDisclosure>;
}
export function LocaleSwitcher(props:{locale:Locale;className?:string}){
 return <Suspense fallback={<button className="language-fallback" disabled aria-label={publicCopy(props.locale).language}><SelectedLanguage locale={props.locale}/></button>}><LanguageLinks {...props}/></Suspense>;
}
