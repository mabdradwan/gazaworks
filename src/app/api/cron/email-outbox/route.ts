import {NextRequest,NextResponse} from "next/server";
import {runEmailWorker} from "@/lib/email/worker";
export const runtime="nodejs";
export const maxDuration=60;
async function run(req:NextRequest){
 if(!process.env.CRON_SECRET||req.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`)return NextResponse.json({error:"unauthorized"},{status:401});
 try{return NextResponse.json(await runEmailWorker());}
 catch{return NextResponse.json({error:"email_worker_failed"},{status:500});}
}
export const GET=run;
export const POST=run;
