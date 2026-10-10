import {z} from 'zod';
import {westernDigits,emailPattern,localPhonePattern} from './professional-data';
export const cvFieldKeys=['name','title','summary','experience','education','projects','skills','software','languages','training','certifications','achievements','goals'] as const;
const field=z.string().transform(westernDigits).pipe(z.string().trim().max(6000));
export const cvContactKeys=['phone','email','website','linkedin'] as const;
export const cvSchema=z.object({name:field.pipe(z.string().max(160)),title:field.pipe(z.string().max(200)),summary:field,experience:field,education:field,projects:field,skills:field,software:field,languages:field,training:field,certifications:field,achievements:field,goals:field,phone:z.string().transform(westernDigits).default(''),email:z.string().trim().default(''),website:z.string().default(''),linkedin:z.string().default('')});
export type CV=z.infer<typeof cvSchema>;
export const emptyCV:CV={name:'',title:'',summary:'',experience:'',education:'',projects:'',skills:'',software:'',languages:'',training:'',certifications:'',achievements:'',goals:'',phone:'',email:'',website:'',linkedin:''};
export function mergeCV(base:CV,suggestion:CV):CV{return Object.fromEntries(Object.keys(base).map(k=>[k,suggestion[k as keyof CV]?.trim()?suggestion[k as keyof CV]:base[k as keyof CV]])) as CV}
export function validCVContact(cv:CV){return localPhonePattern.test(westernDigits(cv.phone))&&emailPattern.test(cv.email)&&['website','linkedin'].every(k=>{const v=cv[k as keyof CV];if(!v)return true;try{return ['https:','http:'].includes(new URL(v).protocol)}catch{return false}})}
export function hasReadableText(value:string){return !/[\uFFFD]/u.test(value)&&!/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(value)}
