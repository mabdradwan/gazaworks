import {z} from 'zod';
export const adminUserSearchSchema=z.object({q:z.string().trim().max(100).default(''),type:z.enum(['individual','team','client']).optional()});
/** Literal substring matching: user input cannot become a wildcard pattern. */
export function memberNamePattern(name:string){return '%'+name.replace(/[\\%_]/g,'\\$&')+'%';}
