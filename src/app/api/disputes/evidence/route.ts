import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

export async function GET(req:NextRequest){
  const disputeId=req.nextUrl.searchParams.get("disputeId"),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user||!disputeId)return NextResponse.json({error:"invalid_request"},{status:400});
  const {data,error}=await db.from("dispute_evidence").select("id,dispute_id,submitted_by,statement,storage_path,created_at").eq("dispute_id",disputeId).order("created_at");
  if(error)return NextResponse.json({error:"load_failed"},{status:400});
  const rows=await Promise.all((data??[]).map(async x=>({...x,url:x.storage_path?(await db.storage.from("dispute-evidence").createSignedUrl(x.storage_path,1800)).data?.signedUrl??null:null})));
  return NextResponse.json(rows);
}

export async function POST(req:NextRequest){
  try{
    const input=z.object({disputeId:z.string().uuid(),statement:z.string().min(3).max(8000),storagePath:z.string().max(500).nullable().optional()}).parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    if(input.storagePath&&!input.storagePath.startsWith(input.disputeId+"/"+user.id+"/"))return NextResponse.json({error:"forbidden"},{status:403});
    const {data,error}=await db.from("dispute_evidence").insert({dispute_id:input.disputeId,submitted_by:user.id,statement:input.statement,storage_path:input.storagePath??null}).select("id").single();
    return error?NextResponse.json({error:"evidence_failed"},{status:400}):NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
