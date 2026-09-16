import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";


export async function POST(req:NextRequest){
 try{const i=z.object({projectId:z.string().uuid(),action:z.enum(["accept","request_revision"])}).parse(await req.json());return await executeWorkflow("gw_review_delivery",{project_id:i.projectId,action:i.action},200);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
