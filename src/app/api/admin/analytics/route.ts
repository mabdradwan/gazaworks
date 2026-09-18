import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";
export async function GET(req:NextRequest){
 try{
  const date=z.string().datetime().nullable();
  return await executeWorkflow("gw_analytics",{from_date:date.parse(req.nextUrl.searchParams.get("from")),to_date:date.parse(req.nextUrl.searchParams.get("to"))});
 }catch{return NextResponse.json({error:"invalid_date_range"},{status:400})}
}
