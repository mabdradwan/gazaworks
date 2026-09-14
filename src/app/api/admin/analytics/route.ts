import {NextResponse} from "next/server";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("users.read");
  if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const admin=supabaseAdmin();
  const [profiles,individuals,teams,clients,projects,transactions,disputes]=await Promise.all([
    admin.from("profiles").select("id",{count:"exact",head:true}),
    admin.from("individual_profiles").select("profile_id",{count:"exact",head:true}).eq("verification_status","verified"),
    admin.from("team_profiles").select("profile_id",{count:"exact",head:true}).eq("verification_status","verified"),
    admin.from("client_profiles").select("profile_id",{count:"exact",head:true}),
    admin.from("projects").select("id,status"),
    admin.from("transactions").select("gross_minor,platform_revenue_minor,worker_entitlement_minor,currency"),
    admin.from("disputes").select("id,status",{count:"exact"})
  ]);
  const tx=transactions.data??[];
  const sums=tx.reduce((a,t)=>({gross:a.gross+Number(t.gross_minor),revenue:a.revenue+Number(t.platform_revenue_minor),owed:a.owed+Number(t.worker_entitlement_minor)}),{gross:0,revenue:0,owed:0});
  const active=(projects.data??[]).filter(p=>!["completed","paid","refunded","cancelled"].includes(p.status)).length;
  const completed=(projects.data??[]).filter(p=>["completed","paid"].includes(p.status)).length;
  return NextResponse.json({
    totalUsers:profiles.count??0,
    verifiedIndividuals:individuals.count??0,
    verifiedTeams:teams.count??0,
    clients:clients.count??0,
    activeProjects:active,
    completedProjects:completed,
    grossMinor:sums.gross,
    platformRevenueMinor:sums.revenue,
    workerEntitlementMinor:sums.owed,
    disputes:disputes.count??0,
    currencies:[...new Set(tx.map(t=>t.currency))]
  });
}
