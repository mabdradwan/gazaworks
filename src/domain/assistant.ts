import {z} from "zod";
import {profileSchema,profileColumns,type ProfileInput} from "./profile";
// Account administration, private identifiers and finances are deliberately absent.
export const assistantChanges = profileSchema.pick({displayName:true,professionalTitle:true,bio:true,location:true,availability:true,yearsExperience:true,languages:true,tools:true,preferredFields:true,linkedinUrl:true,websiteUrl:true,education:true,experience:true,countryCode:true,companyName:true,organizationType:true,teamSize:true,services:true,expertise:true,achievements:true,history:true}).partial().strict();
export const assistantPlanSchema = z.object({action:z.enum(["answer","update_profile","find_work"]),text:z.string().max(12000),changes:assistantChanges.optional()}).strict();
export type AssistantChanges=z.infer<typeof assistantChanges>;
export type AccountKind="individual"|"team"|"client";
export function allowedChanges(input:AssistantChanges,kind:AccountKind){
 const details=profileColumns(input,kind), result:AssistantChanges={};
 for(const [key,value] of Object.entries(input)){
  if(key==="displayName"||Object.keys(profileColumns({[key]:value},kind)).some(column=>column in details))Object.assign(result,{[key]:value});
 }
 return result;
}
export function toWorkflowChanges(changes:AssistantChanges,kind:AccountKind){return {display_name:changes.displayName??null,details:profileColumns(changes as Partial<ProfileInput>,kind)}}
export function explicitEdit(prompt:string,changes:AssistantChanges){
 // Direct requests only. Questions, conditional/quoted instructions require review.
 if(/[?؟]|\b(if|could|can|example|suppose)\b|(?:إذا|لو |مثال|هل |ممكن)|["«»]/i.test(prompt))return false;
 if(!/(?:غي[ّر]+|غير|عد[ّل]+|عدل|بد[ّل]+|بدل|خلي|خلّي|اجعل|أضف|اضف|ضيف|أزل|احذف|change|update|set|add|remove|replace|modifie|changez|ajoute|cambia|añade|actualiza|değiştir|ekle|güncelle|ändere|füge|aktualisiere)/i.test(prompt))return false;
 const targets:Record<string,RegExp>={
  displayName:/اسمي|اسم العرض|اسمى|my name|display name|mon nom|mi nombre|adımı|anzeigename|meinen namen/i,
  yearsExperience:/خبر[ةه]|experience|expérience|experiencia|deneyim|erfahrung/i,
  professionalTitle:/مسمى|مهن[ةي]|professional title|job title|titre|cargo|unvan|berufsbezeichnung/i,
  bio:/نبذ[ةه]|bio|summary|résumé|resumen|özet|zusammenfassung/i,
  location:/موقع|منطق[ةه]|مكان|location|localisation|ubicación|konum|standort/i,
  availability:/تفرغ|توافر|availability|disponibilité|disponibilidad|uygunluk|verfügbarkeit/i,
  languages:/لغ[ةات]|language|langue|idioma|dil|sprache/i,
  tools:/أدوات|ادوات|برامج|tools|outils|herramientas|araç|werkzeug/i,
  preferredFields:/مجالات|fields|domaines|campos|alan|bereiche/i,
  education:/تعليم|دراس|education|éducation|educación|eğitim|ausbildung/i,
  experience:/خبرات|experience|expérience|experiencia|deneyim|erfahrung/i,
  linkedinUrl:/linkedin|لينكد/i,websiteUrl:/موقعي|رابط الموقع|website|site web|sitio|webseite/i,
  companyName:/اسم الشركة|company name|nom de l’entreprise|nombre de empresa|şirket adı|firmenname/i,
  organizationType:/نوع المؤسسة|organization type|organisation|organización|kurum|organisationstyp/i,
  countryCode:/دول[ةه]|country|pays|país|ülke|land/i,
  teamSize:/عدد.*(?:فريق|أعضاء)|team size|taille|tamaño|ekip|teamgröße/i,
  services:/خدمات|services|servicios|hizmet|dienstleistung/i,
  expertise:/تخصص|expertise|especialidad|uzmanlık|fachkenntnis/i,
  achievements:/إنجاز|انجاز|achievements|réalisations|logros|başarı|erfolge/i,
  history:/تاريخ الفريق|team history|historique|historia|geçmiş|geschichte/i
 };
 const keys=Object.keys(changes);return keys.length>0&&keys.every(key=>targets[key]?.test(prompt));
}
