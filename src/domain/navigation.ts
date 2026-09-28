import {isLocale,type Locale} from "../lib/i18n";

const localePrefix=/^\/(ar|en|tr|es|fr|de)(?=\/|$)/;
const safeQueryKeys=new Set(["mode","module","error","q","type","skillId","categoryId","minExperience","maxRate","minRating","availability","language","industry"]);

/** Keep redirects on authenticated application pages, never an external origin or callback. */
export function safeReturnPath(value:string|null|undefined,locale:string):string{
 const fallback=`/${isLocale(locale)?locale:"en"}/dashboard`;
 if(!value||!value.startsWith("/")||value.startsWith("//")||/[\\\s]/.test(value))return fallback;
 try{
  const url=new URL(value,"https://gazaworks.invalid");
  if(url.origin!=="https://gazaworks.invalid"||url.hash)return fallback;
  if(!/^\/(ar|en|tr|es|fr|de)\/(dashboard|talent)(\/|$)/.test(url.pathname)&&!/^\/(ar|en|tr|es|fr|de)\/auth\/reset$/.test(url.pathname))return fallback;
  const query=new URLSearchParams();
  for(const [key,entry] of url.searchParams)if(safeQueryKeys.has(key))query.set(key,entry);
  const suffix=query.toString();
  return url.pathname+(suffix?`?${suffix}`:"");
 }catch{return fallback}
}

/** Preserve UI state while excluding callback codes, tokens and other unknown query parameters. */
export function localizedHref(pathname:string,search:string,locale:Locale):string{
 const path=pathname.replace(localePrefix,"");
 const query=new URLSearchParams();
 for(const [key,value] of new URLSearchParams(search)){
  if(safeQueryKeys.has(key))query.set(key,value);
  if(key==="next")query.set(key,safeReturnPath(value,locale).replace(localePrefix,`/${locale}`));
 }
 const suffix=query.toString();
 return `/${locale}${path}${suffix?`?${suffix}`:""}`;
}
