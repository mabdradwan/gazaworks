import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {aiConsentMetadata} from "@/lib/ai/consent-policy";
export async function POST(req:NextRequest){
 try{
 const input=z.object({accountType:z.enum(["individual","team","client"]),displayName:z.string().trim().min(2).max(100),locale:z.enum(["ar","en","tr","es","fr","de"])}).strict().parse(await req.json());
 const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
 const admin=supabaseAdmin(),{data:existing,error:readError}=await admin.from("profiles").select("id").eq("id",user.id).maybeSingle();
 if(readError)return NextResponse.json({error:"unavailable"},{status:503});if(existing)return NextResponse.json({error:"account_already_exists"},{status:409});
 const {error}=await admin.rpc("gw_provision_profile",{actor:user.id,kind:input.accountType,display_name:input.displayName,locale:input.locale,email:user.email??null});
 if(error)return NextResponse.json({error:"profile_provisioning"},{status:400});
 if(!user.user_metadata?.external_ai_consent_declined_at)await db.auth.updateUser({data:aiConsentMetadata(true)});
 return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
