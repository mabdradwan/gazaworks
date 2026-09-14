import {NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";

export async function GET(){
  const db=await supabaseServer();
  const [{data:categories,error:ce},{data:skills,error:se}]=await Promise.all([
    db.from("categories").select("id,slug,category_translations(locale,name)").eq("active",true).order("slug"),
    db.from("skills").select("id,slug,skill_translations(locale,name)").eq("active",true).order("slug")
  ]);
  if(ce||se) return NextResponse.json({error:"taxonomy_unavailable"},{status:500});
  return NextResponse.json({categories:categories??[],skills:skills??[]});
}
