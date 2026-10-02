import { describe, expect, it } from "vitest";
import { contactInput, isSameOriginHost } from "../src/lib/contact";

describe("public contact form boundary", () => {
  it("accepts a properly scoped message", () => {
    expect(contactInput.safeParse({ name: "Mariam", email: "mariam@example.com", topic: "general", message: "I have a project question." }).success).toBe(true);
  });
  it("rejects arbitrary recipients and oversized messages", () => {
    expect(contactInput.safeParse({ name: "Mariam", email: "mariam@example.com", topic: "general", message: "x".repeat(3001), to: "attacker@example.com" }).success).toBe(false);
    expect(contactInput.parse({ name: "Mariam", email: "mariam@example.com", topic: "general", message: "I have a project question.", to: "attacker@example.com" })).not.toHaveProperty("to");
  });
  it("rejects foreign or malformed origins without throwing", () => {
    expect(isSameOriginHost("https://gazaworks.netlify.app", "gazaworks.netlify.app")).toBe(true);
    expect(isSameOriginHost("https://evil.example", "gazaworks.netlify.app")).toBe(false);
    expect(isSameOriginHost("http://localhost:3000", "localhost:3000")).toBe(true);
    expect(isSameOriginHost("not a URL", "gazaworks.netlify.app")).toBe(false);
    expect(isSameOriginHost("https://gazaworks.netlify.app.evil.example", "gazaworks.netlify.app")).toBe(false);
  });
});
