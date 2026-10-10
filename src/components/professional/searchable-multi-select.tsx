"use client";
import {useEffect,useId,useRef,useState} from "react";
import {professionalCopy} from "@/lib/professional-copy";
import type {SelectOption} from "./searchable-select";
const copy={ar:{hint:"يمكنك اختيار أكثر من تصنيف",empty:"لا توجد نتائج",remove:"إزالة",required:"اختر تصنيفًا واحدًا على الأقل"},en:{hint:"Choose one or more categories",empty:"No results",remove:"Remove",required:"Choose at least one category"},tr:{hint:"Bir veya daha fazla kategori seçin",empty:"Sonuç yok",remove:"Kaldır",required:"En az bir kategori seçin"},es:{hint:"Elige una o varias categorías",empty:"Sin resultados",remove:"Eliminar",required:"Elige al menos una categoría"},fr:{hint:"Choisissez une ou plusieurs catégories",empty:"Aucun résultat",remove:"Supprimer",required:"Choisissez au moins une catégorie"},de:{hint:"Eine oder mehrere Kategorien auswählen",empty:"Keine Ergebnisse",remove:"Entfernen",required:"Mindestens eine Kategorie auswählen"}};
export function SearchableMultiSelect({locale,label,placeholder,options,value,onChange}:{locale:string;label:string;placeholder:string;options:SelectOption[];value:string[];onChange:(value:string[])=>void}){
 const [open,setOpen]=useState(false),[query,setQuery]=useState(""),[invalid,setInvalid]=useState(false),id=useId(),root=useRef<HTMLDivElement>(null),search=useRef<HTMLInputElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const c=copy[locale as keyof typeof copy]??copy.en,p=professionalCopy(locale);
 const normalize=(s:string)=>s.normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f]/g,"").toLowerCase().trim();
 const matches=options.filter(o=>normalize(o.label+" "+(o.search??"")).includes(normalize(query)));
 useEffect(()=>{if(open)search.current?.focus()},[open]);
 useEffect(()=>{function close(e:PointerEvent){if(!root.current?.contains(e.target as Node)){setOpen(false);setQuery("")}}document.addEventListener("pointerdown",close);return()=>document.removeEventListener("pointerdown",close)},[]);
 function toggle(id:string){onChange(value.includes(id)?value.filter(x=>x!==id):[...value,id]);setInvalid(false)}
 return <div className="category-picker grid" ref={root} onKeyDown={e=>{if(e.key==="Escape"){e.preventDefault();setOpen(false);setQuery("");trigger.current?.focus()}}}>
  <label id={`${id}-label`}>{label}</label>
  <button ref={trigger} type="button" className="category-picker-trigger" aria-labelledby={`${id}-label ${id}-summary`} aria-expanded={open} aria-controls={open?`${id}-panel`:undefined} onClick={()=>{setOpen(!open);setQuery("")}}><span id={`${id}-summary`}>{value.length?options.filter(o=>value.includes(o.value)).map(o=>o.label).join(" · "):placeholder}</span><span aria-hidden="true">⌄</span></button>
  <input className="category-picker-validation" aria-label={label} aria-invalid={invalid} tabIndex={-1} value={value.length?"selected":""} required onChange={()=>{}} onInvalid={e=>{e.preventDefault();setInvalid(true);setOpen(true)}}/>
  {value.length>0&&<div className="category-picker-chips">{value.map(v=>{const o=options.find(x=>x.value===v);return o&&<button type="button" className="category-picker-chip" key={v} aria-label={`${c.remove} ${o.label}`} onClick={()=>toggle(v)}>{o.label}<span aria-hidden="true">×</span></button>})}</div>}
  <small className={invalid?"error":"muted"} role={invalid?"alert":undefined}>{invalid?c.required:c.hint}</small>
  {open&&<div id={`${id}-panel`} className="category-picker-panel" role="group" aria-labelledby={`${id}-label`}>
   <input ref={search} type="search" aria-label={`${p.search} — ${label}`} placeholder={p.search} value={query} onChange={e=>setQuery(e.target.value)} autoComplete="off"/>
   <div className="category-picker-options">{matches.length?matches.map(o=><label className="category-picker-option" key={o.value}><input type="checkbox" checked={value.includes(o.value)} onChange={()=>toggle(o.value)}/><span>{o.label}</span></label>):<p role="status" className="muted">{c.empty}</p>}</div>
  </div>}
 </div>;
}
