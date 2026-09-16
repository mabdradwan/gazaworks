import "server-only";
import {generateDraft} from "./generate";
import {extractedProfileSchema,parseDraftJSON,missingProfileFields} from "@/domain/profile-draft";

export async function extractProfileDraft(actor:string,text:string,kind:"individual"|"team",locale:string,mode:"original"|"improved"){
 const keys=kind==="individual"?"displayName, professionalTitle, bio, legalName, phonePrivate, emailPrivate, location, languages, tools, education, experience":"displayName, bio, location, services, expertise, tools, achievements, history, representativePrivate, contactPrivate, teamSize";
 const result=await generateDraft(actor,{task:kind==="team"?"team_draft":"profile_draft",locale,json:true,
  prompt:`Extract a profile from the document. Return {"fields":{...},"skills":[...]}. Allowed field keys: ${keys}. All fields are strings except teamSize (positive integer) and languages/tools/education/experience/services/expertise (arrays of strings). Omit absent or unknown values; do not fill blanks with guesses. Preserve all names, dates, facts and contact details accurately. Contact data belongs only in the private contact fields, never the public bio. ${mode==="original"?"Keep exact original wording for every extracted field; do not translate or improve it.":"Improve the professional wording in the requested language without adding any claims. Keep proper names unchanged."}`,
  grounding:{document:text.slice(0,25_000)}});
 const parsed=extractedProfileSchema.parse(parseDraftJSON(result.text));
 return {...parsed,missingFields:missingProfileFields(parsed.fields,kind),generationId:result.generationId,provider:result.provider,model:result.model};
}
