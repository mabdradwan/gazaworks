import {locales,type Locale} from "@/lib/i18n";

export function enabledLocaleList(value:unknown):Locale[]{
  if(typeof value!=="object"||value===null||!("locales" in value)||!Array.isArray(value.locales))return [...locales];
  const requested=value.locales;
  const allowed=locales.filter(locale=>requested.includes(locale));
  return locales.filter(locale=>locale==="en"||allowed.includes(locale));
}
