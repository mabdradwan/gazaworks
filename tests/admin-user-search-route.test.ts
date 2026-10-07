import {beforeEach,describe,it,expect,vi} from 'vitest';
import {NextRequest} from 'next/server';
const m=vi.hoisted(()=>({permission:vi.fn(),select:vi.fn(),eq:vi.fn(),ilike:vi.fn(),order:vi.fn(),limit:vi.fn()}));
vi.mock('@/lib/admin-auth',()=>({requirePermission:m.permission}));
vi.mock('@/lib/supabase/admin',()=>({supabaseAdmin:()=>({from:()=>({select:m.select})})}));
vi.mock('@/lib/workflows',()=>({executeWorkflow:vi.fn()}));
import {GET} from '../src/app/api/admin/users/route';
beforeEach(()=>{vi.resetAllMocks();m.permission.mockResolvedValue({ok:true});const builder={eq:m.eq,ilike:m.ilike,order:m.order,limit:m.limit};m.select.mockReturnValue(builder);m.eq.mockReturnValue(builder);m.ilike.mockReturnValue(builder);m.order.mockReturnValue(builder);m.limit.mockResolvedValue({data:[],error:null})});
describe('member search API',()=>{
 it('checks read permission before searching profiles',async()=>{m.permission.mockResolvedValue({ok:false,status:403});expect((await GET(new NextRequest('https://preview.test/api/admin/users?q=name'))).status).toBe(403);expect(m.select).not.toHaveBeenCalled()});
 it('filters account type and name before limiting results',async()=>{expect((await GET(new NextRequest('https://preview.test/api/admin/users?q=Ahmed&type=individual'))).status).toBe(200);expect(m.eq).toHaveBeenCalledWith('account_type','individual');expect(m.ilike).toHaveBeenCalledWith('display_name','%Ahmed%');expect(m.limit).toHaveBeenCalledWith(500)});
 it('rejects invalid types without querying',async()=>{expect((await GET(new NextRequest('https://preview.test/api/admin/users?type=admin'))).status).toBe(400);expect(m.select).not.toHaveBeenCalled()});
});
