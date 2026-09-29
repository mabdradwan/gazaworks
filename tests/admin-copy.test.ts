import { describe, expect, it } from "vitest";
import { adminCopy } from "@/lib/admin-copy";

describe("administration navigation", () => {
  it("keeps route keys stable while localizing the visible labels", () => {
    const keys = ["Users", "Verification", "Message Moderation", "Payments", "Security Logs"];
    for (const locale of ["ar", "tr", "es", "fr", "de"]) {
      const copy = adminCopy(locale);
      expect(copy.menu.length).toBeGreaterThan(2);
      for (const key of keys) expect(copy.label(key)).not.toBe(key);
    }
    expect(adminCopy("en").label("Users")).toBe("Users");
  });
});
