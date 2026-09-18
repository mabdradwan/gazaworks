import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";
export async function POST(req:NextRequest){
 try{const i=z.object({workRequestId:z.string().uuid(),talentId:z.string().uuid()}).parse(await req.json());return await executeWorkflow("gw_invite",{request_id:i.workRequestId,talent_id:i.talentId},201);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
