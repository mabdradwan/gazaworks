import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {emailConfiguration} from "@/domain/email";
import {executeWorkflow} from "@/lib/workflows";
export async function GET(req:NextRequest){
 const auth=await requirePermission("email.manage");
 if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
 const page=Number(req.nextUrl.searchParams.get("page")??"0"),status=req.nextUrl.searchParams.get("status");
 if(!Number.isSafeInteger(page)||page<0||page>10000||status&&!["queued","processing","sent","failed","suppressed","review_required"].includes(status))return NextResponse.json({error:"invalid_request"},{status:400});
 const {data,error}=await supabaseAdmin().rpc("gw_email_queue",{actor:auth.user.id,page,filter_status:status});
 return error?NextResponse.json({error:"load_failed"},{status:500}):NextResponse.json({...data,providerConfigured:Boolean(emailConfiguration(process.env))});
}
export async function POST(req:NextRequest){
 try{const input=z.object({id:z.string().uuid()}).strict().parse(await req.json());return executeWorkflow("gw_retry_email",{outbox_id:input.id});}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
