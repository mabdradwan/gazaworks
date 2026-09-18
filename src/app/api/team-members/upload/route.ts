import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

export async function POST(req:NextRequest){
  try{
    const input=z.object({fileName:z.string().min(1).max(180),mimeType:z.enum(["image/jpeg","image/png","image/webp"]),sizeBytes:z.number().int().positive().max(10_485_760)}).parse(await req.json());
    const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data:p}=await db.from("profiles").select("account_type,account_status").eq("id",user.id).single();
    if(p?.account_type!=="team"||p.account_status!=="active")return NextResponse.json({error:"team_required"},{status:403});
    const safe=input.fileName.replace(/[^a-zA-Z0-9._-]+/g,"-"),path=user.id+"/team-members/"+crypto.randomUUID()+"-"+safe;
    const {data,error}=await db.storage.from("avatars").createSignedUploadUrl(path);
    return error?NextResponse.json({error:"upload_unavailable"},{status:400}):NextResponse.json({path,token:data.token,signedUrl:data.signedUrl});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
