import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

const translationValue=z.string().trim().min(1).max(150).optional();
const translationsSchema=z.object({ar:translationValue,en:translationValue,tr:translationValue,es:translationValue,fr:translationValue,de:translationValue});
const schema=z.object({
  kind:z.enum(["category","skill"]),
  slug:z.string().regex(/^[a-z0-9-]+$/).min(2).max(100),
  translations:translationsSchema,
  parentId:z.string().uuid().nullable().optional()
});

export async function POST(req:NextRequest){
  const auth=await requirePermission("taxonomy.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const input=schema.parse(await req.json()),admin=supabaseAdmin();
    if(input.kind==="category"){
      const {data,error}=await admin.from("categories").insert({slug:input.slug,parent_id:input.parentId??null,active:true}).select("id").single();
      if(error||!data)return NextResponse.json({error:"create_failed"},{status:400});
      const rows=Object.entries(input.translations).map(([locale,name])=>({category_id:data.id,locale,name}));
      if(rows.length)await admin.from("category_translations").insert(rows);
      return NextResponse.json({id:data.id},{status:201});
    }
    const {data,error}=await admin.from("skills").insert({slug:input.slug,active:true}).select("id").single();
    if(error||!data)return NextResponse.json({error:"create_failed"},{status:400});
    const rows=Object.entries(input.translations).map(([locale,name])=>({skill_id:data.id,locale,name}));
    if(rows.length)await admin.from("skill_translations").insert(rows);
    return NextResponse.json({id:data.id},{status:201});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}

export async function PATCH(req:NextRequest){
  const auth=await requirePermission("taxonomy.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const input=schema.extend({id:z.string().uuid()}).parse(await req.json()),admin=supabaseAdmin();
    if(input.kind==="category"){
      const {error}=await admin.from("categories").update({slug:input.slug,parent_id:input.parentId??null}).eq("id",input.id);if(error)return NextResponse.json({error:"update_failed"},{status:400});
      const rows=Object.entries(input.translations).map(([locale,name])=>({category_id:input.id,locale,name}));
      if(rows.length)await admin.from("category_translations").upsert(rows,{onConflict:"category_id,locale"});
    }else{
      const {error}=await admin.from("skills").update({slug:input.slug}).eq("id",input.id);if(error)return NextResponse.json({error:"update_failed"},{status:400});
      const rows=Object.entries(input.translations).map(([locale,name])=>({skill_id:input.id,locale,name}));
      if(rows.length)await admin.from("skill_translations").upsert(rows,{onConflict:"skill_id,locale"});
    }
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
