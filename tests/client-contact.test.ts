import {describe,it,expect} from "vitest";
import {validClientContact,profileColumns} from "@/domain/profile";
import {countryOptions} from "@/domain/countries";
describe("client contact fields",()=>{
 it("accepts international phone numbers and standard country selections",()=>{expect(validClientContact({countryCode:"QA",phonePrivate:"+974 1234 5678"})).toBe(true);expect(validClientContact({countryCode:"tr",phonePrivate:"+90 555 123 4567"})).toBe(true)});
 it("rejects missing phone, invalid country, and letters in phone",()=>{expect(validClientContact({countryCode:"QA"})).toBe(false);expect(validClientContact({countryCode:"ZZ",phonePrivate:"1234567890"})).toBe(false);expect(validClientContact({countryCode:"QA",phonePrivate:"phone number"})).toBe(false)});
 it("displays country names while retaining canonical storage values",()=>{const countries=countryOptions("ar");expect(countries.find(c=>c.value==="QA")?.label).toBe("قطر");expect(countries.find(c=>c.value==="PS")?.search).toContain("Palest");expect(profileColumns({countryCode:"qa"},"client")).toEqual({country_code:"QA"})});
 it("clears removed company details without changing the immutable account type",()=>{expect(profileColumns({companyName:"",organizationType:""},"client")).toEqual({company_name:null,organization_type:null})});
});
