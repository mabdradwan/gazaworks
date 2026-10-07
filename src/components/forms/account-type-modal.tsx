'use client';
import {useEffect,useRef} from 'react';
import {CompleteAccount} from './complete-account';
import {uiCopy} from '@/lib/ui-copy';
export function AccountTypeModal({locale,name}:{locale:string;name:string}){
 const dialog=useRef<HTMLDialogElement>(null),c=uiCopy(locale).auth;
 useEffect(()=>{const element=dialog.current;element?.showModal();return()=>element?.close()},[]);
 return <dialog ref={dialog} className="account-type-dialog" aria-label={c.chooseAccount} onCancel={e=>e.preventDefault()}><CompleteAccount locale={locale} next={`/${locale}/dashboard/projects`} name={name}/></dialog>;
}
