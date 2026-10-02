import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {executeWorkflow} from "@/lib/workflows";
import {profileSchema,profileColumns} from "@/domain/profile";


export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("profiles")
    .select("*,individual_profiles(*),team_profiles(*),client_profiles(*),profile_skills(skill_id,level)")
    .eq("id",user.id).single();
  return error?NextResponse.json({error:"not_found"},{status:404}):NextResponse.json(data);
}

export async function PATCH(req:NextRequest){
 try{
  const input=profileSchema.parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data:p}=await db.from("profiles").select("account_type").eq("id",user.id).single();
  const kind=z.enum(["individual","team","client"]).parse(p?.account_type);
  return await executeWorkflow("gw_save_profile",{display_name:input.displayName,details:profileColumns(input,kind),skill_ids:kind!=="client"?input.skillIds??null:null});
 }catch(e){return NextResponse.json({error:e instanceof z.ZodError?"invalid_request":"update_failed"},{status:400})}
}
