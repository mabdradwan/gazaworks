import { describe, expect, it, vi } from "vitest";
import { authRuntimeReady } from "../src/domain/auth-readiness";

describe("authentication deployment readiness", () => {
  it("does not touch the database when server-only configuration is missing", async () => {
    const probe = vi.fn().mockResolvedValue(true);
    expect(await authRuntimeReady(false, probe)).toBe(false);
    expect(probe).not.toHaveBeenCalled();
  });

  it("fails closed for an old schema or a database error", async () => {
    expect(await authRuntimeReady(true, async () => false)).toBe(false);
    expect(await authRuntimeReady(true, async () => { throw new Error("offline"); })).toBe(false);
  });

  it("opens only after the schema probe succeeds", async () => {
    expect(await authRuntimeReady(true, async () => true)).toBe(true);
  });
});
