import {z} from "zod";
import {profileSchema} from "./profile";

export const draftFieldsSchema=profileSchema.pick({displayName:true,professionalTitle:true,bio:true,legalName:true,phonePrivate:true,emailPrivate:true,location:true,languages:true,tools:true,education:true,experience:true,services:true,expertise:true,achievements:true,history:true,representativePrivate:true,contactPrivate:true,teamSize:true}).partial();
export type DraftFields=z.infer<typeof draftFieldsSchema>;
export const extractedProfileSchema=z.object({fields:draftFieldsSchema,skills:z.array(z.string().max(120)).max(80).default([])});
export function missingProfileFields(fields:DraftFields,kind:"individual"|"team"){
 const keys=kind==="individual"?["displayName","professionalTitle","bio","location"] as const:["displayName","bio","location","teamSize"] as const;
 return keys.filter(key=>!fields[key]);
}
export function parseDraftJSON(text:string):unknown{
 return JSON.parse(text.replace(/^\s*```(?:json)?\s*/i,"").replace(/\s*```\s*$/, ""));
}
