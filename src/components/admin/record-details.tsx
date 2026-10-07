import {adminRecordLabel} from "@/lib/admin-record-copy";
import {appointmentState} from "@/lib/appointment-copy";
import {latinLocale} from "@/lib/formatting";
const uuid=/^[0-9a-f]{8}-[0-9a-f-]{27}$/i;
const hidden=new Set(["id","slug","ip_hash","input_hash","storage_path","avatar_path","cv_path","document_path"]);
export function RecordDetails({row,locale}:{row:Record<string,unknown>;locale:string}){
 const fields=Object.entries(row).filter(([key,value])=>!hidden.has(key)&&!key.endsWith("_id")&&!(typeof value==="string"&&uuid.test(value)));
 return <dl className="admin-record-fields">{fields.map(([key,value])=><div className="admin-record-field" key={key}><dt>{adminRecordLabel(locale,key)}</dt><dd><RecordValue value={value} field={key} locale={locale}/></dd></div>)}</dl>;
}
function RecordValue({value,field,locale}:{value:unknown;field:string;locale:string}){
 if(value===null||value===undefined)return <span className="muted">{adminRecordLabel(locale,"missing")}</span>;
 if(typeof value==="boolean")return <span className="badge">{adminRecordLabel(locale,value?"yes":"no")}</span>;
 if(Array.isArray(value))return value.length?<ul className="admin-record-list">{value.map((item,i)=><li key={i}><RecordValue value={item} field={field} locale={locale}/></li>)}</ul>:<span className="muted">{adminRecordLabel(locale,"missing")}</span>;
 if(typeof value==="object")return <RecordDetails row={value as Record<string,unknown>} locale={locale}/>;
 if(typeof value==="number")return <bdi>{new Intl.NumberFormat(latinLocale(locale),{maximumFractionDigits:2}).format(field.endsWith("_minor")?value/100:value)}</bdi>;
 const text=String(value);
 if(field==="body_html")return <span className="admin-record-text" dir="auto">{text.replace(/<[^>]*>/g," ")}</span>;
 if(text==="*")return <span>{adminRecordLabel(locale,"allPermissions")}</span>;
 if(field==="key"||field==="permission_key")return <span>{adminRecordLabel(locale,text)}</span>;
 if(uuid.test(text))return <span className="muted">{adminRecordLabel(locale,"record")}</span>;
 if(/_(at|on)$/.test(field)&&/^\d{4}-\d{2}-\d{2}/.test(text)&&Number.isFinite(Date.parse(text)))return <bdi>{new Intl.DateTimeFormat(latinLocale(locale),{dateStyle:"medium",...(/_at$/.test(field)?{timeStyle:"short" as const}:{}),timeZone:"Asia/Gaza"}).format(new Date(text))}</bdi>;
 if(field==="country_code"&&/^[A-Z]{2}$/.test(text))return <span>{new Intl.DisplayNames([locale],{type:"region"}).of(text)??text}</span>;
 if(field.includes("status")||field==="account_type")return <span className="badge">{adminRecordLabel(locale,text)!==text.replaceAll("_"," ")?adminRecordLabel(locale,text):appointmentState(locale,text)}</span>;
 return <span className="admin-record-text" dir="auto">{text}</span>;
}
