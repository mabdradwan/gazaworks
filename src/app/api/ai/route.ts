import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {AITask,AIUnavailable} from "@/lib/ai/provider";
import {generateDraft} from "@/lib/ai/generate";
import {supabaseServer} from "@/lib/supabase/server";
const schema=z.object({task:AITask,prompt:z.string().min(3).max(8000),locale:z.enum(["ar","en","tr","es","fr","de"])});
export async function POST(req:NextRequest){
 try{
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const input=schema.parse(await req.json());
  const result=await generateDraft(user.id,input);
  return NextResponse.json({...result,draft:true,requiresConfirmation:true});
 }catch(e){return NextResponse.json({error:e instanceof z.ZodError?"invalid_request":e instanceof AIUnavailable?e.message:"service_unavailable"},{status:e instanceof z.ZodError?400:e instanceof AIUnavailable&&e.message==="rate_limited"?429:503})}
}
