const labels:Record<string,string>={ar:"جارٍ التحميل…",en:"Loading…",tr:"Yükleniyor…",es:"Cargando…",fr:"Chargement…",de:"Wird geladen…"};
export function LoadingIndicator({locale="en",label}:{locale?:string;label?:string}){
 return <div className="loading-indicator" role="status" aria-live="polite" aria-busy="true"><span className="loading-orbit" aria-hidden="true"/><span>{label??labels[locale]??labels.en}</span></div>;
}
