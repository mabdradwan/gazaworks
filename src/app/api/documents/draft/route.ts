import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {extractProfileDraft} from "@/lib/ai/profile-draft";
import {draftFieldsSchema} from "@/domain/profile-draft";
import {profileColumns} from "@/domain/profile";
import {executeWorkflow} from "@/lib/workflows";
import {AIUnavailable} from "@/lib/ai/provider";

export async function POST(req:NextRequest){
 try{
  const input=z.object({draftId:z.string().uuid(),mode:z.enum(["original","improved"]),locale:z.enum(["ar","en","tr","es","fr","de"])}).parse(await req.json());
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data:d}=await db.from("profile_drafts").select("source_kind,extracted_data").eq("id",input.draftId).eq("profile_id",user.id).is("confirmed_at",null).single();
  if(!d)return NextResponse.json({error:"draft_unavailable"},{status:404});
  const kind=z.enum(["individual","team"]).parse(d.source_kind),raw=z.object({rawText:z.string().min(20).max(25000)}).parse(d.extracted_data);
  const draft=await extractProfileDraft(user.id,raw.rawText,kind,input.locale,input.mode);
  const {error}=await db.from("profile_drafts").update({extracted_data:{...raw,...draft},rewrite_mode:input.mode}).eq("id",input.draftId).eq("profile_id",user.id).is("confirmed_at",null);
  if(error)throw error;
  return NextResponse.json({draftId:input.draftId,text:raw.rawText,...draft});
 }catch(e){return NextResponse.json({error:e instanceof AIUnavailable?e.message:"draft_unavailable"},{status:503})}
}

export async function PUT(req:NextRequest){
 try{
  const input=z.object({draftId:z.string().uuid(),fields:draftFieldsSchema,confirmed:z.literal(true)}).parse(await req.json());
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data:p}=await db.from("profiles").select("account_type").eq("id",user.id).single();
  const kind=z.enum(["individual","team"]).parse(p?.account_type);
  return await executeWorkflow("gw_save_profile",{display_name:input.fields.displayName??null,details:profileColumns(input.fields,kind),draft_id:input.draftId});
 }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
