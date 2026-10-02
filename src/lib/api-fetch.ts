/** JSON endpoints retain a usable error response during network/proxy failures. */
export async function apiFetch(input:RequestInfo|URL,init?:RequestInit):Promise<Response>{
 try{
  const response=await fetch(input,init);
  if(response.status!==204&&!response.headers.get("content-type")?.includes("application/json"))return Response.json({error:"service_unavailable"},{status:503});
  return response;
 }catch{return Response.json({error:"network_unavailable"},{status:503})}
}
