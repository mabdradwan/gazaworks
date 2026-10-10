import {describe,it,expect} from 'vitest';
import {accountSettingsSchema,validBirthDate,ageFromBirthDate} from '../src/domain/account-settings';
import {accountSettingsCopy} from '../src/lib/account-settings-copy';
import {safeReturnPath} from '../src/domain/navigation';
describe('account settings',()=>{
 it('rejects invalid and future dates and computes birthday boundaries',()=>{
  expect(validBirthDate('2025-02-29','2026-10-07')).toBe(false);expect(validBirthDate('2024-02-29','2026-10-07')).toBe(true);expect(validBirthDate('2027-01-01','2026-10-07')).toBe(false);
  expect(ageFromBirthDate('2000-10-08',new Date('2026-10-07T12:00:00Z'))).toBe(25);expect(ageFromBirthDate('2000-10-08',new Date('2026-10-08T12:00:00Z'))).toBe(26);expect(ageFromBirthDate('')).toBe(null);
 });
 it('allows clearing private birth date but rejects account ownership and privilege fields',()=>{
  expect(accountSettingsSchema.safeParse({displayName:'Mohammed',dateOfBirth:''}).success).toBe(true);
  for(const extra of [{actor:'other'},{account_type:'client'},{is_admin:true},{email:'other@example.com'}])expect(accountSettingsSchema.safeParse({displayName:'Mohammed',...extra}).success).toBe(false);
 });
 it('localizes account settings and keeps confirmation callback local',()=>{
  for(const locale of ['ar','en','tr','es','fr','de'])expect(Object.values(accountSettingsCopy(locale)).every(v=>!!v)).toBe(true);
  expect(safeReturnPath('/ar/dashboard/settings','ar')).toBe('/ar/dashboard/settings');
 });
});
