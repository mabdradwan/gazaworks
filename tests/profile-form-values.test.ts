import {describe,expect,it} from "vitest";
import {profileCsv,profileRateDisplay,profileRateMinor} from "@/domain/profile-form-values";

describe("profile pricing input",()=>{
  it("converts visible currency amounts to exact stored minor units",()=>{
    expect(profileRateMinor("25.50")).toBe(2550);
    expect(profileRateMinor("0.29")).toBe(29);
    expect(profileRateMinor("25")).toBe(2500);
    expect(profileRateMinor("0")).toBe(0);
    expect(profileRateMinor("1000000.00")).toBe(100000000);
    expect(profileRateDisplay(2550)).toBe("25.50");
    expect(profileRateMinor(profileRateDisplay(29))).toBe(29);
    expect(profileRateMinor(null)).toBeUndefined();
  });
  it.each(["-1","1.001","1e3","NaN","1000000.01"])("rejects invalid or out-of-range rate %s",value=>{
    expect(()=>profileRateMinor(value)).toThrow("invalid_rate");
  });
});

it("separates lists entered with Arabic and English commas",()=>{
  expect(profileCsv("العربية، الإنجليزية, التركية، ")).toEqual(["العربية","الإنجليزية","التركية"]);
});
