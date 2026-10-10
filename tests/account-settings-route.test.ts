import {beforeEach,describe,expect,it,vi} from 'vitest';
import {NextRequest,NextResponse} from 'next/server';
const m=vi.hoisted(()=>({user:vi.fn(),profile:vi.fn(),workflow:vi.fn()}));
vi.mock('@/lib/supabase/server',()=>({supabaseServer:async()=>({auth:{getUser:m.user},from:()=>({select:()=>({eq:()=>({single:m.profile})})})})}));
vi.mock('@/lib/workflows',()=>({executeWorkflow:m.workflow}));
import {PATCH} from '../src/app/api/account/settings/route';
function request(body:unknown={displayName:'New Name'}){return new NextRequest('https://preview.test/api/account/settings',{method:'PATCH',body:JSON.stringify(body)})}
beforeEach(()=>{vi.resetAllMocks();m.user.mockResolvedValue({data:{user:{id:'caller'}}});m.profile.mockResolvedValue({data:{account_type:'individual',account_status:'active'}});m.workflow.mockResolvedValue(NextResponse.json({ok:true}))});
describe('account settings ownership',()=>{
 it('rejects visitors and suspended accounts before writing',async()=>{m.user.mockResolvedValue({data:{user:null}});expect((await PATCH(request())).status).toBe(401);m.user.mockResolvedValue({data:{user:{id:'caller'}}});m.profile.mockResolvedValue({data:{account_type:'individual',account_status:'suspended'}});expect((await PATCH(request())).status).toBe(403);expect(m.workflow).not.toHaveBeenCalled()});
 it('rejects injected owners and account-type changes',async()=>{expect((await PATCH(request({displayName:'New Name',actor:'other'}))).status).toBe(400);expect(m.workflow).not.toHaveBeenCalled()});
 it('updates only the requested personal fields and leaves contacts and skills intact',async()=>{expect((await PATCH(request({displayName:'New Name',dateOfBirth:'2000-10-08'}))).status).toBe(200);expect(m.workflow).toHaveBeenCalledWith('gw_save_profile',{display_name:'New Name',details:{date_of_birth_private:'2000-10-08'}})});
 it.each(['team','client'])('updates a %s name without individual fields',async kind=>{m.profile.mockResolvedValue({data:{account_type:kind,account_status:'active'}});expect((await PATCH(request())).status).toBe(200);expect(m.workflow).toHaveBeenCalledWith('gw_save_profile',{display_name:'New Name',details:{}});expect((await PATCH(request({displayName:'New Name',dateOfBirth:''}))).status).toBe(400)});
});
