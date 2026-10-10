import {describe,it,expect} from 'vitest';
import {westernDigits,localPhonePattern,emailPattern,orderedTools,roles} from '../src/domain/professional-data';
import {mergeCV,emptyCV,cvSchema,validCVContact} from '../src/domain/cv';
import {positionedPDFText,cleanDocumentText,corruptedDocumentText} from '../src/domain/document-text';
import {latinLocale} from '../src/lib/formatting';
describe('professional input rules',()=>{
 it('normalizes Arabic and Persian digits without changing words or dates',()=>{expect(westernDigits('٠٥٩١٢٣٤٥٦٧ / ۲۰۲۶ غزة')).toBe('0591234567 / 2026 غزة')});
 it('accepts only complete Gaza local phone numbers',()=>{expect(localPhonePattern.test(westernDigits('٠٥٩١٢٣٤٥٦٧'))).toBe(true);for(const v of ['+970591234567','059123','591234567','05a1234567','00970591234567'])expect(localPhonePattern.test(v)).toBe(false)});
 it('requires explicit valid contact details before saving a CV',()=>{expect(validCVContact({...emptyCV,phone:'0591234567',email:'name@example.com'})).toBe(true);expect(validCVContact({...emptyCV,email:'name@example.com'})).toBe(false);expect(emailPattern.test('name@localhost')).toBe(false);expect(validCVContact({...emptyCV,phone:'0591234567',email:'name@example.com',website:'javascript:alert(1)'})).toBe(false)});
 it('ranks role tools without dropping other choices',()=>{expect(orderedTools('UI/UX Designer').slice(0,2)).toEqual(['Figma','Adobe XD']);expect(orderedTools('مونتير فيديو').slice(0,3)).toEqual(['Adobe Premiere Pro','Adobe After Effects','CapCut']);expect(new Set(roles.map(r=>r.id)).size).toBe(roles.length)});
});
describe('non-destructive CV suggestions',()=>{
 it('does not erase sections absent from AI output and keeps contact unchanged',()=>{const old={...emptyCV,education:'BBA in 2026',phone:'0591234567',experience:'Original experience'};const next=mergeCV(old,{...emptyCV,experience:'Translated experience'});expect(next.education).toBe(old.education);expect(next.phone).toBe(old.phone);expect(next.experience).toBe('Translated experience')});
 it('loads legacy CVs with optional new contacts while rejecting malformed generated sections',()=>{const legacy=Object.fromEntries(Object.entries(emptyCV).filter(([k])=>!['phone','email','website','linkedin'].includes(k)));expect(cvSchema.parse(legacy).phone).toBe('');expect(()=>cvSchema.parse({...emptyCV,education:['wrong type']})).toThrow()});
});
describe('document text integrity',()=>{
 const item=(str:string,x:number,y:number,width:number,dir='ltr')=>({str,transform:[10,0,0,10,x,y],width,dir});
 it('joins fragmented letters at adjacent positions without cutting Gaza',()=>{expect(positionedPDFText([item('غز',80,20,10,'rtl'),item('ة',75,20,5,'rtl')])).toBe('غزة')});
 it('sorts lines and RTL words while preserving logical character order',()=>{expect(positionedPDFText([item('غزة',60,20,20,'rtl'),item('جامعة',100,20,30,'rtl'),item('2026',20,10,25)])).toBe('جامعة غزة\n2026')});
 it('keeps Latin words separate and preserves source facts during cleanup',()=>{expect(positionedPDFText([item('Product',0,40,35),item('Designer',40,40,40)])).toBe('Product Designer');expect(cleanDocumentText('جامعة غزة\u0000\n٢٠٢٦')).toBe('جامعة غزة\n2026');expect(corruptedDocumentText('A long document with broken \ufffd text')).toBe(true)});
 it('uses Western numerals in localized dates',()=>{expect(new Intl.DateTimeFormat(latinLocale('ar'),{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'UTC'}).format(new Date('2026-10-02'))).not.toMatch(/[٠-٩]/)});
});
