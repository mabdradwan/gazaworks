import "server-only";
import {createHmac,timingSafeEqual} from "node:crypto";
import {z} from "zod";
import {assistantChanges} from "@/domain/assistant";
const schema=z.object({actor:z.string().uuid(),kind:z.enum(["individual","team","client"]),changes:z.record(z.unknown()),expected:z.record(z.unknown()),expires:z.number(),undo:z.boolean()}).strict();
export type ActionToken=z.infer<typeof schema>;
function secret(){const key=process.env.CRON_SECRET??process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)throw Error("action_unavailable");return key}
export function signAction(input:Omit<ActionToken,"expires">){const payload=Buffer.from(JSON.stringify({...input,expires:Date.now()+30*60*1000})).toString("base64url"),signature=createHmac("sha256",secret()).update(payload).digest("base64url");return payload+"."+signature}
export function verifyAction(token:string,actor:string){const parts=token.split(".");if(parts.length!==2)throw Error("invalid_action");const [payload,signature]=parts,expected=createHmac("sha256",secret()).update(payload).digest(),provided=Buffer.from(signature,"base64url");if(provided.length!==expected.length||!timingSafeEqual(provided,expected))throw Error("invalid_action");const data=schema.parse(JSON.parse(Buffer.from(payload,"base64url").toString()));if(data.actor!==actor||data.expires<Date.now())throw Error("invalid_action");for(const [key,value] of Object.entries(data.changes)){if(!(key in assistantChanges.shape))throw Error("invalid_action");if(value!==null||!data.undo)assistantChanges.shape[key as keyof typeof assistantChanges.shape].parse(value)}return data}
