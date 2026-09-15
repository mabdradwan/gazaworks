import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";

const schema=z.object({portfolioId:z.string().uuid(),fileName:z.string().min(1).max(180),mimeType:z.enum(["image/jpeg","image/png","image/webp","video/mp4","video/webm"]),sizeBytes:z.number().int().positive()});

export async function POST(req:NextRequest){
  try{
    const input=schema.parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const {data:p}=await db.from("portfolios").select("id").eq("id",input.portfolioId).eq("profile_id",user.id).single();
    if(!p)return NextResponse.json({error:"forbidden"},{status:403});
    const type=input.mimeType.startsWith("image/")?"image":"video";
    const {data:limits}=await db.from("settings").select("value").eq("key","portfolio_limits").single();
    const cfg=(limits?.value??{}) as {image_bytes?:number;video_bytes?:number;images?:number;videos?:number};
    const maxBytes=type==="image"?(cfg.image_bytes??10_485_760):(cfg.video_bytes??104_857_600);
    if(input.sizeBytes>maxBytes)return NextResponse.json({error:"file_too_large"},{status:413});
    const {count}=await db.from("portfolio_media").select("id",{count:"exact",head:true}).eq("portfolio_id",input.portfolioId).eq("media_type",type);
    const maxCount=type==="image"?(cfg.images??6):(cfg.videos??3);
    if((count??0)>=maxCount)return NextResponse.json({error:"portfolio_limit_reached"},{status:409});
    const safe=input.fileName.replace(/[^a-zA-Z0-9._-]+/g,"-");
    const path=`${user.id}/${input.portfolioId}/${crypto.randomUUID()}-${safe}`;
    const {data,error}=await db.storage.from("portfolio").createSignedUploadUrl(path);
    return error?NextResponse.json({error:"upload_unavailable"},{status:400}):NextResponse.json({path,token:data.token,signedUrl:data.signedUrl,mediaType:type});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

export async function PUT(req:NextRequest){
  try{
    const input=z.object({portfolioId:z.string().uuid(),path:z.string(),mimeType:z.string(),sizeBytes:z.number().int().positive(),mediaType:z.enum(["image","video"])}).parse(await req.json()),db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user||!input.path.startsWith(user.id+"/"))return NextResponse.json({error:"forbidden"},{status:403});
    const {data:p}=await db.from("portfolios").select("id").eq("id",input.portfolioId).eq("profile_id",user.id).single();
    if(!p)return NextResponse.json({error:"forbidden"},{status:403});
    const {data,error}=await db.from("portfolio_media").insert({portfolio_id:input.portfolioId,storage_path:input.path,mime_type:input.mimeType,size_bytes:input.sizeBytes,media_type:input.mediaType}).select("id").single();
    return error?NextResponse.json({error:"record_failed"},{status:400}):NextResponse.json(data,{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
