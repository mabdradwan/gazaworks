import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';

// Ephemeral CLI stack only. Never accept hosted project credentials.
const settings=JSON.parse(readFileSync(process.argv[2],'utf8'));
const url=settings.API_URL;
assert.equal(new URL(url).hostname,'127.0.0.1','Only the disposable loopback stack is permitted');
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const admin=createClient(url,settings.SERVICE_ROLE_KEY,options);
const client=()=>createClient(url,settings.ANON_KEY,options);
const checked=(result,label)=>{assert.equal(result.error,null,label);return result.data;};
for(const type of ['individual','team','client']){
 const email=`${type}-${randomUUID()}@example.invalid`;
 const password=`Test-only-${randomUUID()}!`;
 const db=client();
 const signup=checked(await db.auth.signUp({email,password,options:{data:{account_type:type,display_name:`Test ${type}`,locale:'ar'}}}),'signup');
 assert.ok(signup.user?.id);assert.equal(signup.session,null,'Confirmation must be required');
 assert.ok((await db.auth.signInWithPassword({email,password})).error,'Unconfirmed login must fail');
 // A local admin-generated link exercises real token verification without depending
 // on an external mailbox. Inbox delivery and Google OAuth are separate acceptance.
 const link=checked(await admin.auth.admin.generateLink({type:'magiclink',email}),'confirmation link');
 checked(await db.auth.verifyOtp({token_hash:link.properties.hashed_token,type:link.properties.verification_type}),'confirm account');
 const profile=checked(await db.from('profiles').select('id,account_type,account_status').eq('id',signup.user.id).single(),'profile read');
 assert.equal(profile.account_type,type);assert.equal(profile.account_status,'active');
 checked(await db.auth.signOut(),'sign out');
 const signin=checked(await db.auth.signInWithPassword({email,password}),'password login');
 assert.equal(signin.user.id,signup.user.id);
 const refreshed=checked(await db.auth.refreshSession(),'refresh session');
 assert.equal(refreshed.user.id,signup.user.id);
 const foreign=checked(await db.from('profiles').select('id').neq('id',signup.user.id),'private profiles');
 assert.equal(foreign.length,0,'Other unverified profiles must remain private');
 const mutation=await db.from('profiles').update({account_type:type==='client'?'team':'client'}).eq('id',signup.user.id);
 const still=checked(await db.from('profiles').select('account_type').eq('id',signup.user.id).single(),'immutable type');
 assert.equal(still.account_type,type);
 assert.ok(mutation.error||still.account_type===type);
 const recovery=checked(await admin.auth.admin.generateLink({type:'recovery',email}),'recovery link');
 const reset=client();
 checked(await reset.auth.verifyOtp({token_hash:recovery.properties.hashed_token,type:'recovery'}),'recovery token');
 const newPassword=`Reset-only-${randomUUID()}!`;
 checked(await reset.auth.updateUser({password:newPassword}),'update password');
 checked(await reset.auth.signOut(),'reset sign out');
 assert.ok((await client().auth.signInWithPassword({email,password})).error,'Old password must fail');
 checked(await client().auth.signInWithPassword({email,password:newPassword}),'new password login');
 console.log(`PASS Auth HTTP: ${type} signup, confirmation, login, refresh, privacy, immutable type, recovery`);
}
const noType=checked(await admin.auth.admin.createUser({email:`untyped-${randomUUID()}@example.invalid`,password:`Only-test-${randomUUID()}!`,email_confirm:true}),'untyped identity');
const absent=checked(await admin.from('profiles').select('id').eq('id',noType.user.id).maybeSingle(),'untyped profile lookup');
assert.equal(absent,null,'An identity without an explicit type must not silently become a client');
console.log('PASS Auth HTTP: missing account type does not create a client profile');
