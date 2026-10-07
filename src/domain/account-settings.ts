import {z} from 'zod';
export function validBirthDate(value:string,today=new Date().toISOString().slice(0,10)){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value<'1900-01-01'||value>today)return false;
 const parsed=new Date(value+'T00:00:00Z');return !Number.isNaN(parsed.valueOf())&&parsed.toISOString().slice(0,10)===value;
}
export function ageFromBirthDate(value:string,today=new Date()){
 if(!validBirthDate(value,today.toISOString().slice(0,10)))return null;
 const [year,month,day]=value.split('-').map(Number);return today.getUTCFullYear()-year-(today.getUTCMonth()+1<month||(today.getUTCMonth()+1===month&&today.getUTCDate()<day)?1:0);
}
export const accountSettingsSchema=z.object({displayName:z.string().trim().min(2).max(100),dateOfBirth:z.string().refine(v=>v===''||validBirthDate(v)).optional()}).strict();
