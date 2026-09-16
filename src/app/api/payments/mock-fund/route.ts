import {paymentSimulationEnabled} from "@/domain/payment-availability";
import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";
export async function POST(req:NextRequest){
 if(!paymentSimulationEnabled({provider:process.env.PAYMENT_PROVIDER,vercelEnvironment:process.env.VERCEL_ENV,nodeEnvironment:process.env.NODE_ENV,allow:process.env.ALLOW_PAYMENT_SIMULATOR}))return NextResponse.json({error:"mock_disabled"},{status:404});
 try{const i=z.object({projectId:z.string().uuid(),providerFeeMinor:z.number().int().nonnegative().default(0)}).parse(await req.json());return await executeWorkflow("gw_mock_fund",{project_id:i.projectId,provider_fee:i.providerFeeMinor},201);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
