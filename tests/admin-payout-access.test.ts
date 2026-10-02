import {beforeEach,describe,expect,it,vi} from "vitest";

const mocks=vi.hoisted(()=>({permission:vi.fn(),admin:vi.fn(),from:vi.fn(),select:vi.fn(),order:vi.fn(),limit:vi.fn()}));
vi.mock("@/lib/admin-auth",()=>({requirePermission:mocks.permission}));
vi.mock("@/lib/supabase/admin",()=>({supabaseAdmin:mocks.admin}));
vi.mock("@/lib/workflows",()=>({executeWorkflow:vi.fn()}));

import {GET} from "../src/app/api/admin/payouts/route";

beforeEach(()=>{
 vi.resetAllMocks();
 mocks.admin.mockReturnValue({from:mocks.from});
 mocks.from.mockReturnValue({select:mocks.select});
 mocks.select.mockReturnValue({order:mocks.order});
 mocks.order.mockReturnValue({limit:mocks.limit});
 mocks.limit.mockResolvedValue({data:[],error:null});
});

describe("administrative payout privacy",()=>{
 it("requires payout authority before reading transfer destinations",async()=>{
  mocks.permission.mockResolvedValue({ok:false,status:403});
  expect((await GET()).status).toBe(403);
  expect(mocks.permission).toHaveBeenCalledWith("payouts.approve");
  expect(mocks.admin).not.toHaveBeenCalled();
 });
 it("includes simulation evidence for an authorized finance officer",async()=>{
  mocks.permission.mockResolvedValue({ok:true,status:200});
  expect((await GET()).status).toBe(200);
  expect(mocks.select.mock.calls[0][0]).toContain("payments(status,simulated,amount_minor)");
 });
});
