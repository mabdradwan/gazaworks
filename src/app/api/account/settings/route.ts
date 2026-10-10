import {NextRequest,NextResponse} from 'next/server';
import {accountSettingsSchema} from '@/domain/account-settings';
import {supabaseServer} from '@/lib/supabase/server';
import {executeWorkflow} from '@/lib/workflows';
export async function PATCH(request:NextRequest){
 const input=accountSettingsSchema.safeParse(await request.json().catch(()=>null));
 if(!input.success)return NextResponse.json({error:'invalid_request'},{status:400});
 const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:'unauthorized'},{status:401});
 const {data:profile}=await db.from('profiles').select('account_type,account_status').eq('id',user.id).single();
 if(!profile||profile.account_status!=='active')return NextResponse.json({error:'forbidden'},{status:403});
 if(input.data.dateOfBirth!==undefined&&profile.account_type!=='individual')return NextResponse.json({error:'invalid_request'},{status:400});
 return executeWorkflow('gw_save_profile',{display_name:input.data.displayName,details:input.data.dateOfBirth===undefined?{}:{date_of_birth_private:input.data.dateOfBirth||null}});
}
