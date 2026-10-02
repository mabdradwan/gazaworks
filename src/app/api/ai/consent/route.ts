import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {aiConsentMetadata,hasAIConsent} from "@/lib/ai/consent-policy";
export async function GET(){
 const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
 return NextResponse.json({signedIn:Boolean(user),accepted:user?hasAIConsent(user.user_metadata):false},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(req:NextRequest){
 try{
  const {accepted}=z.object({accepted:z.boolean()}).strict().parse(await req.json());
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {error}=await db.auth.updateUser({data:aiConsentMetadata(accepted)});
  return NextResponse.json({accepted:!error&&accepted},{status:error?503:200});
 }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
