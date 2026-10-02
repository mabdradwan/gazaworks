"use client";
import {useEffect,useRef,useState,type ReactNode} from "react";

/** Native disclosure keeps normal link and keyboard semantics. */
export function NavigationDisclosure({label,summary,children,className}:{label:string;summary:ReactNode;children:ReactNode;className?:string}){
 const root=useRef<HTMLDetailsElement>(null);
 const [open,setOpen]=useState(false);
 useEffect(()=>{
  if(!open)return;
  function outside(event:PointerEvent){if(event.target instanceof Node&&!root.current?.contains(event.target)&&root.current)root.current.open=false}
  document.addEventListener("pointerdown",outside);
  return()=>document.removeEventListener("pointerdown",outside);
 },[open]);
 return <details ref={root} className={className} onToggle={event=>setOpen(event.currentTarget.open)} onBlur={event=>{
  if(event.relatedTarget instanceof Node&&!event.currentTarget.contains(event.relatedTarget))event.currentTarget.open=false;
 }} onKeyDown={event=>{
  if(event.key==="Escape"&&event.currentTarget.open){event.preventDefault();event.currentTarget.open=false;event.currentTarget.querySelector("summary")?.focus()}
 }} onClick={event=>{
  if(event.target instanceof Element&&event.target.closest("a"))event.currentTarget.open=false;
 }}><summary aria-label={label}>{summary}</summary>{children}</details>;
}
