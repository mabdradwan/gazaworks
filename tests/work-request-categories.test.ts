import {describe,it,expect} from 'vitest';
import {workRequestSchema} from '@/lib/security';
const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
const input={title:'AI video editing',description:'Produce and edit a professional video using AI tools.',skills:[],budgetMin:100,budgetMax:200,currency:'USD',visibility:'public'};
describe('work request category selection',()=>{
 it('preserves all selected categories and one legacy primary',()=>{const result=workRequestSchema.parse({...input,categoryIds:[a,b]});expect(result.categoryIds).toEqual([a,b]);expect(result.categoryId).toBe(a)});
 it('accepts existing single-category callers',()=>{expect(workRequestSchema.parse({...input,categoryId:a}).categoryIds).toEqual([a])});
 it('deduplicates repeated selections without dropping distinct values',()=>{expect(workRequestSchema.parse({...input,categoryIds:[a,a,b]}).categoryIds).toEqual([a,b])});
 it('requires a category and rejects invalid or excessive lists',()=>{for(const categoryIds of [[],['AI'],Array(61).fill(a)])expect(workRequestSchema.safeParse({...input,categoryIds}).success).toBe(false);expect(workRequestSchema.safeParse(input).success).toBe(false)});
});
