export function googleProviderEnabled(settings:unknown):boolean {
  if(typeof settings!=="object"||settings===null||!("external" in settings))return false;
  const providers=settings.external;
  return typeof providers==="object"&&providers!==null&&"google" in providers&&providers.google===true;
}
