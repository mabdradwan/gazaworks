import {paymentSimulationEnabled} from "@/domain/payment-availability";
import {NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";
export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("projects").select("id,status,deadline,created_at,client_id,talent_id,work_request_id,transactions(gross_minor,payments(status,simulated,amount_minor)),project_agreements(scope,price_minor,currency),profiles!projects_client_id_fkey(display_name),talent:profiles!projects_talent_id_fkey(display_name)").order("created_at",{ascending:false});
  if(error)return NextResponse.json({error:"load_failed"},{status:400});
  const simulator=paymentSimulationEnabled({provider:process.env.PAYMENT_PROVIDER,vercelEnvironment:process.env.VERCEL_ENV,nodeEnvironment:process.env.NODE_ENV,allow:process.env.ALLOW_PAYMENT_SIMULATOR});
  return NextResponse.json((data??[]).map(({transactions,...project})=>{
   const tx=Array.isArray(transactions)?transactions:[transactions];
   const captured=tx.flatMap(t=>(t?.payments??[]).filter(p=>p.status==="captured"&&p.amount_minor===t?.gross_minor));
   return {...project,payment_simulated:captured.some(p=>p.simulated),payment_secured:captured.some(p=>!p.simulated),simulator_enabled:simulator};
  }));
}

