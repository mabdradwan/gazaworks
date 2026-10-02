/** Reject browser mutations from a different origin before cookie-backed routes execute. */
export function mutationOriginAllowed(input:{method:string;path:string;origin:string|null;host:string;fetchSite:string|null}){
 if(!["POST","PUT","PATCH","DELETE"].includes(input.method)||!input.path.startsWith("/api/"))return true;
 if(input.path.startsWith("/api/cron/")||input.path.startsWith("/api/webhooks/"))return true;
 if(input.fetchSite==="cross-site")return false;
 if(!input.origin)return true;
 try{
  const url=new URL(input.origin);
  return (url.protocol==="https:"||url.protocol==="http:"&&["localhost","127.0.0.1"].includes(url.hostname))&&url.host===input.host&&!url.username&&!url.password;
 }catch{return false;}
}
