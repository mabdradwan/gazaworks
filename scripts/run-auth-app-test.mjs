import {readFileSync} from 'node:fs';
import {spawn,spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const configPath=process.argv[2];
const config=JSON.parse(readFileSync(configPath,'utf8'));
assert.equal(new URL(config.API_URL).hostname,'127.0.0.1');
const env={...process.env,NEXT_PUBLIC_SUPABASE_URL:config.API_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY:config.ANON_KEY,SUPABASE_SERVICE_ROLE_KEY:config.SERVICE_ROLE_KEY,AUTH_TEST_APP_URL:'http://127.0.0.1:3000',AI_PROVIDER:'mock',PAYMENT_PROVIDER:'mock'};
const build=spawnSync('npm',['run','build'],{env,stdio:'inherit'});
assert.equal(build.status,0,'Application build failed');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1'],{env,stdio:'inherit'});
try{
 let ready=false;
 for(let attempt=0;attempt<120;attempt++){
  if(server.exitCode!==null)throw new Error('Application server exited');
  try{const response=await fetch(`${env.AUTH_TEST_APP_URL}/api/health`);if(response.ok){ready=true;break}}catch{}
  await new Promise(resolve=>setTimeout(resolve,250));
 }
 assert.ok(ready,'Application did not start');
 const result=await new Promise((resolve,reject)=>{
  const test=spawn(process.execPath,['scripts/test-auth-http.mjs',configPath],{env,stdio:'inherit'});
  test.on('error',reject);test.on('exit',resolve);
 });
 assert.equal(result,0,'Auth/application integration failed');
}finally{server.kill('SIGTERM')}
