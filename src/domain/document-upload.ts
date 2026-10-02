/** Reject mismatched file headers and oversized DOCX expansion before parsing. */
export function validateDocumentUpload(name:string,mime:string,buffer:Buffer):"pdf"|"docx"{
 if(buffer.length===0||buffer.length>4*1024*1024)throw new Error("file_too_large");
 if(name.toLowerCase().endsWith(".pdf")&&mime==="application/pdf"&&buffer.subarray(0,5).toString()==="%PDF-")return "pdf";
 if(buffer.length<4||!name.toLowerCase().endsWith(".docx")||mime!=="application/vnd.openxmlformats-officedocument.wordprocessingml.document"||buffer.readUInt32LE(0)!==0x04034b50)throw new Error("unsupported_file_type");
 let end=-1;
 for(let i=buffer.length-22;i>=Math.max(0,buffer.length-65557);i--){if(buffer.readUInt32LE(i)===0x06054b50){end=i;break}}
 if(end<0)throw new Error("invalid_document");
 const entries=buffer.readUInt16LE(end+10),directorySize=buffer.readUInt32LE(end+12);
 let offset=buffer.readUInt32LE(end+16),expanded=0,hasDocument=false;
 if(entries===0||entries>2000||offset+directorySize>end)throw new Error("invalid_document");
 for(let n=0;n<entries;n++){
  if(offset+46>end||buffer.readUInt32LE(offset)!==0x02014b50)throw new Error("invalid_document");
  const flags=buffer.readUInt16LE(offset+8),method=buffer.readUInt16LE(offset+10),size=buffer.readUInt32LE(offset+24);
  const length=buffer.readUInt16LE(offset+28),extra=buffer.readUInt16LE(offset+30),comment=buffer.readUInt16LE(offset+32);
  expanded+=size;
  if((flags&1)!==0||![0,8].includes(method)||expanded>20*1024*1024||offset+46+length+extra+comment>end)throw new Error("invalid_document");
  if(buffer.subarray(offset+46,offset+46+length).toString()==="word/document.xml")hasDocument=true;
  offset+=46+length+extra+comment;
 }
 if(!hasDocument)throw new Error("invalid_document");
 return "docx";
}
