import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {extractProfileDraft} from "@/lib/ai/profile-draft";
import {validateDocumentUpload} from "@/domain/document-upload";
import {AIUnavailable} from "@/lib/ai/provider";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 try{
  if(Number(req.headers.get("content-length")??0)>4_300_000)return NextResponse.json({error:"file_too_large"},{status:413});
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const form=await req.formData(),file=form.get("file");
  const kind=z.enum(["individual","team"]).parse(form.get("kind")??"individual"),locale=z.enum(["ar","en","tr","es","fr","de"]).parse(form.get("locale")??"en");
  const {data:profile}=await db.from("profiles").select("account_type,account_status").eq("id",user.id).single();
  if(profile?.account_type!==kind||profile.account_status!=="active")return NextResponse.json({error:"forbidden"},{status:403});
  if(!(file instanceof File))return NextResponse.json({error:"file_required"},{status:400});
  if(file.size>4*1024*1024)return NextResponse.json({error:"file_too_large"},{status:413});
  const buffer=Buffer.from(await file.arrayBuffer()),type=validateDocumentUpload(file.name,file.type,buffer);
  let text="";
  if(type==="pdf")text=(await (await import("pdf-parse")).default(buffer,{max:100})).text;
  else text=(await (await import("mammoth")).extractRawText({buffer})).value;
  text=text.replace(/\u0000/g,"").trim().slice(0,25_000);
  if(text.length<20)return NextResponse.json({error:"document_text_unavailable"},{status:422});
  const path=`${user.id}/${crypto.randomUUID()}.${type}`;
  const {error:upload}=await db.storage.from("documents").upload(path,buffer,{contentType:file.type,upsert:false});
  if(upload)return NextResponse.json({error:"upload_failed"},{status:400});
  // Always preserve source text even when an external AI provider is unavailable.
  let draft:Awaited<ReturnType<typeof extractProfileDraft>>|null=null,warning:string|null=null;
  try{draft=await extractProfileDraft(user.id,text,kind,locale,"original")}catch(e){warning=e instanceof AIUnavailable?e.message:"ai_unavailable"}
  const extracted_data={rawText:text,...(draft??{})};
  const {data,error}=await db.from("profile_drafts").insert({profile_id:user.id,source_path:path,source_kind:kind,extracted_data,rewrite_mode:"original"}).select("id").single();
  if(error){await db.storage.from("documents").remove([path]);return NextResponse.json({error:"draft_save_failed"},{status:400})}
  return NextResponse.json({draftId:data.id,text,fields:draft?.fields??{},skills:draft?.skills??[],missingFields:draft?.missingFields??[],warning},{status:201});
 }catch(e){const code=e instanceof Error&&["file_too_large","unsupported_file_type","invalid_document"].includes(e.message)?e.message:e instanceof z.ZodError?"invalid_request":"extract_failed";return NextResponse.json({error:code},{status:code==="file_too_large"?413:400})}
}
