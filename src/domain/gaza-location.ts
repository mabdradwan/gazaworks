/** Coarse nearest-town suggestion, not an address or evidence of Gaza residence.
 * Coordinates: GeoNames (CC BY 4.0), https://www.geonames.org/advanced-search.html?country=PS&q=Gaza
 */
const towns=[
 ['مدينة غزة','Gaza City',31.50161,34.46672],['جباليا','Jabalia',31.5272,34.483471],['بيت لاهيا','Beit Lahia',31.5464,34.49514],['بيت حانون','Beit Hanoun',31.535298,34.535787],['دير البلح','Deir al-Balah',31.41834,34.34933],['النصيرات','Nuseirat',31.448611,34.3925],['البريج','Bureij',31.439444,34.403056],['الزوايدة','Zawayda',31.439544,34.380529],['خان يونس','Khan Yunis',31.340177,34.306268],['رفح','Rafah',31.29722,34.24357],['بني سهيلا','Bani Suheila',31.343369,34.323369],['القرارة','Al-Qarara',31.373891,34.340847],['عبسان الكبيرة','Abasan al-Kabira',31.319131,34.340052],['خزاعة','Khuzaa',31.30675,34.361099],['أم النصر','Umm an-Nasr',31.560845,34.51863],['جحر الديك','Juhr ad-Dik',31.455714,34.437189]
] as const;
export function nearestGazaTown(latitude:number,longitude:number,locale:string){if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||latitude<31.21||latitude>31.61||longitude<34.2||longitude>34.58)return null;const ranked=towns.map(t=>({t,km:111*Math.hypot(latitude-t[2],(longitude-t[3])*Math.cos(latitude*Math.PI/180))})).sort((a,b)=>a.km-b.km);if(ranked[0].km>8)return null;return ranked[0].t[locale==='ar'?0:1]}
