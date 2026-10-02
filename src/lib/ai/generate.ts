import "server-only";
import {createHash} from "node:crypto";
import {aiProvider,AIUnavailable,type AIInput} from "./provider";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function generateDraft(actor:string,input:AIInput){
 const db=supabaseAdmin();
 const {error:limit}=await db.rpc("gw_ai_quota",{actor});
 if(limit)throw new AIUnavailable(limit.message==="rate_limited"?"rate_limited":"ai_unavailable");
 const result=await aiProvider().complete(input);
 if(result.provider==="mock")throw new AIUnavailable("ai_not_configured");
 const {data,error}=await db.from("ai_interactions").insert({profile_id:actor,task:input.task,provider:result.provider,model:result.model,input_hash:createHash("sha256").update(JSON.stringify(input)).digest("hex"),response:result.text,status:"draft"}).select("id").single();
 if(error)throw new AIUnavailable("draft_save_failed");
 return {...result,generationId:data.id as string};
}
