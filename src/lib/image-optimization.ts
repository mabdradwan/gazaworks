'use client';
/** Re-encode uploads before storage, remove metadata and cap both dimensions and bytes. */
export async function optimizeImage(file:File,maxDimension=1600):Promise<File>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))return file;
 if(file.size>30*1024*1024)throw Error('image_too_large');
 const image=await createImageBitmap(file);
 try{const ratio=Math.min(1,maxDimension/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));const context=canvas.getContext('2d');if(!context)throw Error('image_processing_failed');context.drawImage(image,0,0,canvas.width,canvas.height);let blob:Blob|null=null;for(const quality of [.82,.7,.55]){blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));if(blob&&blob.size<=1200000)break}if(!blob||blob.size>1200000)throw Error('image_processing_failed');const extension=blob.type==='image/webp'?'webp':blob.type==='image/png'?'png':'jpg';return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.'+extension,{type:blob.type,lastModified:Date.now()})}finally{image.close()}
}
