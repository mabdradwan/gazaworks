import {NextRequest,NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabase/admin";
async function run(req:NextRequest){
 if(!process.env.CRON_SECRET||req.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`)return NextResponse.json({error:"unauthorized"},{status:401});
 const {data,error}=await supabaseAdmin().rpc("gw_run_timers");
 return error?NextResponse.json({error:"timer_failed"},{status:500}):NextResponse.json(data);
}
export const POST=run;
export const GET=run;
