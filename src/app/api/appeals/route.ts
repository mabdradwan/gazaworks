import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";


export async function POST(req:NextRequest){
 try{const i=z.object({disputeId:z.string().uuid(),reasoning:z.string().trim().min(10).max(8000)}).parse(await req.json());return await executeWorkflow("gw_appeal",{dispute_id:i.disputeId,reasoning:i.reasoning},201);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
