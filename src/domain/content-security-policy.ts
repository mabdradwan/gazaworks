type PolicyEnvironment={supabaseUrl?:string;development?:boolean};

function serviceOrigin(value:string|undefined,development:boolean):string|null{
 if(!value)return null;
 try{
  const url=new URL(value);
  const local=development&&["localhost","127.0.0.1","[::1]"].includes(url.hostname);
  if(url.protocol!=="https:"&&!(local&&url.protocol==="http:"))return null;
  if(url.username||url.password||url.pathname!=="/"||url.search||url.hash)return null;
  return url.origin;
 }catch{return null}
}

export function contentSecurityPolicy({supabaseUrl,development=false}:PolicyEnvironment):string{
 const origin=serviceOrigin(supabaseUrl,development);
 const socket=origin?.replace(/^http/,"ws");
 const storage=origin?` ${origin}/storage/v1/`:"";
 const connect=["'self'",origin,socket].filter(Boolean).join(" ");
 return [
  "default-src 'self'",
  `img-src 'self' data: blob:${storage}`,
  `media-src 'self' blob:${storage}`,
  `script-src 'self' 'unsafe-inline'${development?" 'unsafe-eval'":""}`,
  "style-src 'self' 'unsafe-inline'",
  `connect-src ${connect}`,
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'"
 ].join("; ");
}
