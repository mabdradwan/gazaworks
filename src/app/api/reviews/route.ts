import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
const rating=z.number().int().min(1).max(5);
const schema=z.object({projectId:z.string().uuid(),subjectId:z.string().uuid(),communication:rating,professionalism:rating,overall:rating,quality:rating.optional(),delivery:rating.optional(),clarity:rating.optional(),cooperation:rating.optional(),feedback:z.string().max(3000).optional()});
export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("reviews").select("id,project_id,author_id,subject_id,communication,professionalism,overall,quality,delivery,clarity,cooperation,feedback,moderation_status").or(`author_id.eq.${user.id},subject_id.eq.${user.id}`);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function POST(req:NextRequest){
  try{
    const input=schema.parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data,error}=await db.from("reviews").insert({project_id:input.projectId,author_id:user.id,subject_id:input.subjectId,communication:input.communication,professionalism:input.professionalism,overall:input.overall,quality:input.quality,delivery:input.delivery,clarity:input.clarity,cooperation:input.cooperation,feedback:input.feedback}).select("id").single();
    return error?NextResponse.json({error:"review_failed"},{status:400}):NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
