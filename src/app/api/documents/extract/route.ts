import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase/server";
import {aiProvider} from "@/lib/ai/provider";

export const runtime="nodejs";

export async function POST(req:NextRequest){
  try{
    const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const form=await req.formData();
    const file=form.get("file");
    const kind=z.enum(["individual","team"]).parse(form.get("kind")??"individual");
    const locale=z.enum(["ar","en","tr","es","fr","de"]).parse(form.get("locale")??"en");
    if(!(file instanceof File))return NextResponse.json({error:"file_required"},{status:400});
    if(file.size>20*1024*1024)return NextResponse.json({error:"file_too_large"},{status:413});
    const buffer=Buffer.from(await file.arrayBuffer());
    let text="";
    const lower=file.name.toLowerCase();
    if(file.type==="application/pdf"||lower.endsWith(".pdf")){
      const pdfParse=(await import("pdf-parse")).default;
      text=(await pdfParse(buffer)).text;
    }else if(file.type==="application/vnd.openxmlformats-officedocument.wordprocessingml.document"||lower.endsWith(".docx")){
      const mammoth=await import("mammoth");
      text=(await mammoth.extractRawText({buffer})).value;
    }else{
      return NextResponse.json({error:"unsupported_file_type"},{status:415});
    }
    text=text.replace(/\u0000/g,"").trim().slice(0,80_000);
    if(text.length<20)return NextResponse.json({error:"document_text_unavailable"},{status:422});
    const safe=file.name.replace(/[^a-zA-Z0-9._-]+/g,"-");
    const path=`${user.id}/${crypto.randomUUID()}-${safe}`;
    const {error:uploadError}=await db.storage.from("documents").upload(path,buffer,{contentType:file.type||undefined,upsert:false});
    if(uploadError)return NextResponse.json({error:"upload_failed",detail:uploadError.message},{status:400});
    const prompt=kind==="team"
      ? `Extract a structured professional team profile from this document. Return concise sections for team name, summary, services, skills, industries, achievements, previous projects, tools, and members. Do not invent facts.\n\nDOCUMENT:\n${text}`
      : `Extract a structured professional CV/profile from this document. Return concise sections for name, title, summary, experience, education, skills, languages, certifications, tools, and projects. Do not invent facts.\n\nDOCUMENT:\n${text}`;
    const ai=await aiProvider().complete({task:kind==="team"?"team_draft":"profile_draft",prompt,locale,grounding:{source:"uploaded_document"}});
    const {data:draft,error}=await db.from("profile_drafts").insert({profile_id:user.id,source_path:path,source_kind:kind,extracted_data:{rawText:text.slice(0,25_000),aiDraft:ai.text,provider:ai.provider,model:ai.model},rewrite_mode:"original"}).select("id").single();
    if(error)return NextResponse.json({error:"draft_save_failed"},{status:400});
    return NextResponse.json({draftId:draft.id,sourcePath:path,text,aiDraft:ai.text,provider:ai.provider,model:ai.model},{status:201});
  }catch(e){
    return NextResponse.json({error:e instanceof z.ZodError?"invalid_request":"extract_failed"},{status:e instanceof z.ZodError?400:500});
  }
}
