"use client";
import {usePathname,useSearchParams} from "next/navigation";
import {useEffect,useRef,useState} from "react";
const text:Record<string,string>={ar:"جارٍ الانتقال إلى الصفحة…",en:"Opening the page…",tr:"Sayfa açılıyor…",es:"Abriendo la página…",fr:"Ouverture de la page…",de:"Seite wird geöffnet…"};
export function NavigationFeedback({locale}:{locale:string}){
 const pathname=usePathname(),search=useSearchParams(),[pending,setPending]=useState(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{setPending(false);if(timer.current)clearTimeout(timer.current)},[pathname,search]);
 useEffect(()=>{
  function clicked(event:MouseEvent){
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>("a[href]"):null;
   if(!link||link.hasAttribute("download")||link.target==="_blank"||link.getAttribute("aria-disabled")==="true")return;
   const target=new URL(link.href,location.href);
   if(target.origin!==location.origin||target.pathname===location.pathname&&target.search===location.search)return;
   setPending(true);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setPending(false),30000);
  }
  function settled(){setPending(false)}
  document.addEventListener("click",clicked,true);window.addEventListener("pageshow",settled);
  return()=>{document.removeEventListener("click",clicked,true);window.removeEventListener("pageshow",settled);if(timer.current)clearTimeout(timer.current)};
 },[]);
 return pending?<div className="navigation-feedback" role="status" aria-live="polite"><div className="navigation-progress"/><div className="navigation-feedback-card"><span className="navigation-spinner" aria-hidden="true"/><strong>{text[locale]??text.en}</strong></div></div>:null;
}
