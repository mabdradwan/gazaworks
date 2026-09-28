import {z} from "zod";
export const cvFieldKeys=["name","title","summary","experience","education","projects","skills","software","languages","training","certifications","achievements","goals"] as const;
const field=z.string().trim().max(6000);
export const cvSchema=z.object({name:field.max(160),title:field.max(200),summary:field,experience:field,education:field,projects:field,skills:field,software:field,languages:field,training:field,certifications:field,achievements:field,goals:field});
export type CV=z.infer<typeof cvSchema>;
export const emptyCV:CV={name:"",title:"",summary:"",experience:"",education:"",projects:"",skills:"",software:"",languages:"",training:"",certifications:"",achievements:"",goals:""};
