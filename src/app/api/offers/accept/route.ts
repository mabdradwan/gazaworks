import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";


export async function POST(req:NextRequest){
 try{const i=z.object({offerId:z.string().uuid()}).parse(await req.json());return await executeWorkflow("gw_accept_offer",{offer_id:i.offerId},201);}
 catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
