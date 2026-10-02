import {westernDigits} from './professional-data';
type TextItem={str:string;transform:number[];width:number;height?:number;dir?:string};
/** Preserve Unicode logical order. Only reorder positioned words, never reverse characters. */
export function positionedPDFText(items:TextItem[]){
 const rows:{y:number;items:TextItem[]}[]=[];
 for(const item of items){if(!item.str?.trim())continue;const y=item.transform[5];const tolerance=Math.max(2,Math.abs(item.transform[3])*.3);let row=rows.find(r=>Math.abs(r.y-y)<=tolerance);if(!row){row={y,items:[]};rows.push(row)}row.items.push(item)}
 return rows.sort((a,b)=>b.y-a.y).map(row=>{
  const rtl=row.items.some(i=>i.dir==='rtl')||row.items.map(i=>i.str).join('').match(/[\u0600-\u06FF]/g)?.length;
  const sorted=row.items.sort((a,b)=>rtl?b.transform[4]-a.transform[4]:a.transform[4]-b.transform[4]);
  return sorted.map((item,i)=>{if(!i)return item.str;const prev=sorted[i-1],gap=rtl?prev.transform[4]-(item.transform[4]+item.width):item.transform[4]-(prev.transform[4]+prev.width);const space=gap>Math.max(1,Math.abs(item.transform[0])*.12)||/\s$/.test(prev.str)||/^\s/.test(item.str);return (space?' ':'')+item.str}).join('')
 }).join('\n');
}
export function cleanDocumentText(text:string){return westernDigits(text).normalize("NFKC").replace(/\u0000/g,'').replace(/[\u202A-\u202E\u2066-\u2069]/g,'').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim()}
export function corruptedDocumentText(text:string){const replacement=(text.match(/\uFFFD/g)??[]).length;return replacement>0||text.length<20||/[\u0001-\u0008\u000B\u000E-\u001F]/.test(text)}
