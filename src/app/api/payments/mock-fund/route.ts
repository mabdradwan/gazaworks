import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";
export async function POST(req:NextRequest){
 if(process.env.PAYMENT_PROVIDER!=="mock"||process.env.VERCEL_ENV==="production"||(process.env.NODE_ENV==="production"&&process.env.ALLOW_PAYMENT_SIMULATOR!=="true"))return NextResponse.json({error:"mock_disabled"},{status:404});
 try{const i=z.object({projectId:z.string().uuid(),providerFeeMinor:z.number().int().nonnegative().default(0)}).parse(await req.json());return await executeWorkflow("gw_mock_fund",{project_id:i.projectId,provider_fee:i.providerFeeMinor},201);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
