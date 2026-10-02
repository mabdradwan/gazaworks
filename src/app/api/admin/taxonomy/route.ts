import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {executeWorkflow} from "@/lib/workflows";

const translationValue=z.string().trim().min(1).max(150).optional();
const translationsSchema=z.object({ar:translationValue,en:translationValue,tr:translationValue,es:translationValue,fr:translationValue,de:translationValue})
  .strict().refine(value=>Object.values(value).some(name=>name!==undefined));
const schema=z.object({
  kind:z.enum(["category","skill"]),
  slug:z.string().regex(/^[a-z0-9-]+$/).min(2).max(100),
  translations:translationsSchema,
  parentId:z.string().uuid().nullable().optional()
});

async function save(req:NextRequest,update:boolean){
  try{
    const body=await req.json();
    const input=update?schema.extend({id:z.string().uuid()}).parse(body):schema.parse(body);
    return await executeWorkflow("gw_save_taxonomy",{
      entry_kind:input.kind,entry_slug:input.slug,translations:input.translations,
      entry_id:"id" in input?input.id:null,parent_id:input.parentId??null,
    },update?200:201);
  }catch{
    return NextResponse.json({error:"invalid_request"},{status:400});
  }
}

export async function POST(req:NextRequest){return save(req,false)}
export async function PATCH(req:NextRequest){return save(req,true)}
