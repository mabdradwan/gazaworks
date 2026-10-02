import "server-only";
import {targetLanguage} from "./language";
import {isLocale} from "@/lib/i18n";
import {hasReadableText} from "@/domain/cv";
import {AIUnavailable} from "./provider";
import {cleanDocumentText} from "@/domain/document-text";
import {generateDraft} from "./generate";
import {extractedProfileSchema,parseDraftJSON,missingProfileFields} from "@/domain/profile-draft";

export async function extractProfileDraft(actor:string,text:string,kind:"individual"|"team",locale:string,mode:"original"|"improved"){
 const keys=kind==="individual"?"displayName, professionalTitle, bio, legalName, phonePrivate, emailPrivate, location, languages, tools, education, experience":"displayName, bio, location, services, expertise, tools, achievements, history, representativePrivate, contactPrivate, teamSize";
 const result=await generateDraft(actor,{task:kind==="team"?"team_draft":"profile_draft",locale,json:true,
  prompt:`Extract a profile from the document. Return {"fields":{...},"skills":[...]}. Allowed field keys: ${keys}. All fields are strings except teamSize (positive integer) and languages/tools/education/experience/services/expertise (arrays of strings). All extracted arrays MUST be INSIDE the fields object, not at the root. Extract every supplied education, experience, language and tool section into its own corresponding field. Do not put education into bio or tools/languages into skills. Omit only absent or unknown values; do not fill blanks with guesses. Preserve all names, dates, facts and contact details accurately. Contact data belongs only in the private contact fields, never the public bio. ${mode==="original"?"Keep exact original wording for every extracted field; do not translate or improve it.":`${isLocale(locale)?targetLanguage(locale):""} Improve professional wording without adding claims. Keep each source section in its corresponding field. Never shorten or repair uncertain words by guessing.`}`,
  grounding:{document:text.slice(0,25_000)}});
 const parsed=extractedProfileSchema.parse(parseDraftJSON(result.text));
 if(Object.values(parsed.fields).flatMap(v=>Array.isArray(v)?v:typeof v==="string"?[v]:[]).some(v=>!hasReadableText(v)))throw new AIUnavailable("unreadable_ai_output");
 for(const [key,value] of Object.entries(parsed.fields)){if(typeof value==="string")(parsed.fields as Record<string,unknown>)[key]=cleanDocumentText(value);else if(Array.isArray(value))(parsed.fields as Record<string,unknown>)[key]=value.map(cleanDocumentText)}
 return {...parsed,missingFields:missingProfileFields(parsed.fields,kind),generationId:result.generationId,provider:result.provider,model:result.model};
}
