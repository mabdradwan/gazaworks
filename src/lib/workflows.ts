import "server-only";
import {NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function executeWorkflow(name:string, args:Record<string,unknown>, status=200){
  const session=await supabaseServer();
  const {data:{user}}=await session.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await supabaseAdmin().rpc(name,{...args,actor:user.id});
  if(error){
    const safe=/^[a-z_]+$/.test(error.message)?error.message:"workflow_failed";
    return NextResponse.json({error:safe},{status:error.code==="42501"?403:safe==="rate_limited"?429:409});
  }
  return NextResponse.json(data,{status});
}
