import {z} from "zod";
export const profileSchema=z.object({
  displayName:z.string().trim().min(2).max(100),
  professionalTitle:z.string().trim().max(120).optional(),
  bio:z.string().trim().max(4000).optional(),
  location:z.string().trim().max(120).optional(),
  availability:z.string().trim().max(80).optional(),
  yearsExperience:z.number().int().min(0).max(80).optional(),
  legalName:z.string().trim().max(160).optional(),
  phonePrivate:z.string().trim().max(80).optional(),
  emailPrivate:z.string().trim().email().max(180).optional().or(z.literal("")),
  hourlyRateMinor:z.number().int().min(0).max(100000000).optional(),
  currency:z.enum(["USD","EUR","TRY","ILS"]).optional(),
  languages:z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  tools:z.array(z.string().trim().min(1).max(100)).max(50).optional(),
  dateOfBirth:z.string().date().optional().or(z.literal("")),
  preferredFields:z.array(z.string().trim().min(1).max(120)).max(30).optional(),
  linkedinUrl:z.string().url().max(500).optional().or(z.literal("")),
  websiteUrl:z.string().url().max(500).optional().or(z.literal("")),
  education:z.array(z.string().trim().min(1).max(500)).max(30).optional(),
  experience:z.array(z.string().trim().min(1).max(1000)).max(50).optional(),
  skillIds:z.array(z.string().uuid()).max(80).optional(),
  countryCode:z.string().trim().length(2).optional(),
  companyName:z.string().trim().max(150).optional(),
  organizationType:z.string().trim().max(100).optional(),
  teamSize:z.number().int().min(1).max(1000).optional(),
  services:z.array(z.string().trim().min(1).max(150)).max(50).optional(),
  expertise:z.array(z.string().trim().min(1).max(150)).max(50).optional(),
  achievements:z.string().trim().max(5000).optional(),
  history:z.string().trim().max(5000).optional(),
  representativePrivate:z.string().trim().max(200).optional(),
  contactPrivate:z.string().trim().max(300).optional(),
  teamRateMinor:z.number().int().min(0).max(100000000).optional()
});
export type ProfileInput=z.infer<typeof profileSchema>;

const columns:Record<string,string>={professionalTitle:"professional_title",bio:"bio",location:"gaza_location",availability:"availability",yearsExperience:"years_experience",legalName:"legal_name",phonePrivate:"phone_private",emailPrivate:"email_private",hourlyRateMinor:"hourly_rate_minor",currency:"currency",languages:"languages",tools:"tools",dateOfBirth:"date_of_birth_private",preferredFields:"preferred_fields",linkedinUrl:"linkedin_url",websiteUrl:"website_url",education:"education",experience:"experience",countryCode:"country_code",companyName:"company_name",organizationType:"organization_type",teamSize:"team_size",services:"services",expertise:"expertise",achievements:"achievements",history:"history",representativePrivate:"representative_private",contactPrivate:"contact_private",teamRateMinor:"rate_minor"};
const allowed={
 individual:new Set(["professionalTitle","bio","location","availability","yearsExperience","legalName","phonePrivate","emailPrivate","hourlyRateMinor","currency","languages","tools","dateOfBirth","preferredFields","linkedinUrl","websiteUrl","education","experience"]),
 team:new Set(["bio","location","currency","linkedinUrl","websiteUrl","teamSize","services","expertise","achievements","history","representativePrivate","contactPrivate","teamRateMinor"]),
 client:new Set(["countryCode","companyName","organizationType","phonePrivate"])
};
export function profileColumns(input:Partial<ProfileInput>,kind:keyof typeof allowed){
 return Object.fromEntries(Object.entries(input).filter(([key,value])=>allowed[kind].has(key)&&value!==undefined).map(([key,value])=>[kind==="team"&&key==="bio"?"description":columns[key],key==="countryCode"&&typeof value==="string"?value.toUpperCase():value===""?null:value]));
}
