/** Always use Western digits while retaining translated month names and currency labels. */
export function latinLocale(locale?:string){return (locale||'en').replace(/-u-.*/, '')+'-u-nu-latn'}
