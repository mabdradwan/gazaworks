import {describe,it,expect} from 'vitest';
import {adminUserSearchSchema,memberNamePattern} from '../src/domain/admin-user-search';
import {adminGroups,adminNavigationCopy,adminAccountType} from '../src/lib/admin-navigation';
describe('administrative member search',()=>{
 it('preserves Arabic and treats wildcards literally',()=>{expect(memberNamePattern('أحمد')).toBe('%أحمد%');expect(memberNamePattern('name_%')).toBe('%name\\_\\%%');expect(adminUserSearchSchema.parse({q:' أحمد ',type:'individual'}).q).toBe('أحمد')});
 it('rejects unrecognized account types and oversized queries',()=>{expect(adminUserSearchSchema.safeParse({type:'admin'}).success).toBe(false);expect(adminUserSearchSchema.safeParse({q:'a'.repeat(101)}).success).toBe(false)});
 it('has one navigation entry per module and translated group names',()=>{const modules=adminGroups.flatMap(g=>g.modules);expect(new Set(modules).size).toBe(modules.length);for(const locale of ['ar','en','tr','es','fr','de'])expect(adminGroups.every(g=>adminNavigationCopy(locale).groups[g.key])).toBe(true);expect(adminAccountType('Teams')).toBe('team');expect(adminAccountType('Users')).toBeUndefined()});
});
