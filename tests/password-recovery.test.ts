import {beforeEach,describe,expect,it,vi} from "vitest";
import {recoveryCallback,replaceRecoveredPassword,sendRecoveryLink,type RecoveryClient} from "../src/domain/password-recovery";
const auth={resetPasswordForEmail:vi.fn(),getUser:vi.fn(),updateUser:vi.fn(),signOut:vi.fn()};
const client:RecoveryClient={auth};
beforeEach(()=>{vi.resetAllMocks();auth.resetPasswordForEmail.mockResolvedValue({error:null});auth.getUser.mockResolvedValue({data:{user:{id:"synthetic"}},error:null});auth.updateUser.mockResolvedValue({error:null});auth.signOut.mockResolvedValue({error:null});});
describe("password recovery",()=>{
  it.each(["ar","en","tr","es","fr","de"])("returns %s recovery through the PKCE callback",locale=>{
    const url=new URL(recoveryCallback("https://gazaworks.netlify.app",locale));expect(url.pathname).toBe("/auth/callback");expect(url.searchParams.get("locale")).toBe(locale);expect(url.searchParams.get("next")).toBe(`/${locale}/auth/reset?mode=update`);
  });
  it("sends a trimmed address with a preview-bound callback",async()=>{
    expect(await sendRecoveryLink(client," test@example.invalid ","https://preview.test","ar")).toBe("sent");const args=auth.resetPasswordForEmail.mock.calls[0];expect(args[0]).toBe("test@example.invalid");expect(new URL(args[1].redirectTo).origin).toBe("https://preview.test");
  });
  it("contains provider and network errors without exposing their contents",async()=>{
    auth.resetPasswordForEmail.mockResolvedValue({error:{message:"private provider detail"}});expect(await sendRecoveryLink(client,"test@example.invalid","https://app.test","en")).toBe("failed");auth.resetPasswordForEmail.mockRejectedValue(new Error("network"));expect(await sendRecoveryLink(client,"test@example.invalid","https://app.test","en")).toBe("failed");
  });
  it.each([["short","short"],["long-enough-example","different"],["x".repeat(129),"x".repeat(129)]])("rejects invalid input before contacting auth",async(password,confirmation)=>{
    expect(await replaceRecoveredPassword(client,password,confirmation)).toBe("invalid_password");expect(auth.getUser).not.toHaveBeenCalled();
  });
  it("rejects missing or expired sessions before update",async()=>{
    auth.getUser.mockResolvedValue({data:{user:null},error:null});expect(await replaceRecoveredPassword(client,"test-only-password","test-only-password")).toBe("invalid_session");expect(auth.updateUser).not.toHaveBeenCalled();
  });
  it("does not sign out or report success after a failed update",async()=>{
    auth.updateUser.mockResolvedValue({error:{message:"expired"}});expect(await replaceRecoveredPassword(client,"test-only-password","test-only-password")).toBe("failed");expect(auth.signOut).not.toHaveBeenCalled();
  });
  it("updates the verified session and requests global logout",async()=>{
    expect(await replaceRecoveredPassword(client,"test-only-password","test-only-password")).toBe("updated");expect(auth.signOut).toHaveBeenCalledWith({scope:"global"});
  });
  it("preserves the successful update when logout fails",async()=>{
    auth.signOut.mockRejectedValue(new Error("network"));expect(await replaceRecoveredPassword(client,"test-only-password","test-only-password")).toBe("updated_session_active");
  });
});
