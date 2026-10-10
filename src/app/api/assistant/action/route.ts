import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {verifyAction,signAction} from "@/lib/ai/action-token";
import {toWorkflowChanges,type AssistantChanges} from "@/domain/assistant";
import {hasAIConsent} from "@/lib/ai/consent-policy";
export async function POST(req:NextRequest){
 try{
  const {token}=z.object({token:z.string().max(30000)}).strict().parse(await req.json()),session=await supabaseServer(),{data:{user}}=await session.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const plan=verifyAction(token,user.id);
  if(!plan.undo&&!hasAIConsent(user.user_metadata))return NextResponse.json({error:"consent_required"},{status:403});
  const workflow=toWorkflowChanges(plan.changes as AssistantChanges,plan.kind);
  const {data,error}=await supabaseAdmin().rpc("gw_apply_ai_profile",{actor:user.id,display_name:workflow.display_name,details:workflow.details,expected:plan.expected,undo:plan.undo});
  if(error)return NextResponse.json({error:error.message==="profile_conflict"?"profile_conflict":"update_failed"},{status:error.message==="profile_conflict"?409:400});
  const old=data.previous as Record<string,unknown>,after=data.current as Record<string,unknown>,inverse:AssistantChanges={};
  for(const key of Object.keys(plan.changes)){
   const column=key==="displayName"?"display_name":Object.keys(toWorkflowChanges({[key]:plan.changes[key as keyof AssistantChanges]},plan.kind).details)[0];
   Object.assign(inverse,{[key]:old[column]??null});
  }
  const undoToken=signAction({actor:user.id,kind:plan.kind,changes:inverse,expected:after,undo:true});
  return NextResponse.json({ok:true,changes:plan.changes,undoToken});
 }catch{return NextResponse.json({error:"invalid_action"},{status:400})}
}
