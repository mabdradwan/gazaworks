"use client";
import {useId,useRef,useState} from "react";
import {professionalCopy} from "@/lib/professional-copy";
export type SelectOption={value:string;label:string;search?:string};
export function SearchableSelect({locale,name,label,placeholder,options,value,onChange,required=true}:{locale:string;name:string;label:string;placeholder:string;options:SelectOption[];value:string;onChange:(value:string)=>void;required?:boolean}){
 const [query,setQuery]=useState(""),id=useId(),root=useRef<HTMLDivElement>(null),c=professionalCopy(locale);
 const normalize=(s:string)=>s.normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f]/g,"").toLowerCase().trim();
 const matches=options.filter(o=>o.value===value||normalize(o.label+" "+(o.search??"")).includes(normalize(query)));
 return <div className="grid professional-control" ref={root}><label htmlFor={id}>{label}</label><input type="search" aria-label={`${c.search} — ${label}`} placeholder={c.search} value={query} onChange={e=>setQuery(e.target.value)} autoComplete="off"/><select id={id} aria-label={label} name={name} value={value} required={required} onChange={e=>{onChange(e.target.value);setQuery("")}}><option value="">{placeholder}</option>{matches.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
}
