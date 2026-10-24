import {describe,expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {RoleSelect,FieldSelect} from '@/components/professional/controls';
import {roles} from '@/domain/professional-data';

describe('professional selectors',()=>{
 it('renders an existing professional title only in its own group',()=>{
  const html=renderToStaticMarkup(createElement(RoleSelect,{locale:'en',value:'Video Editor',onChange:()=>{}}));
  expect(html.match(/value="Video Editor"/g)).toHaveLength(1);
 });
 it('keeps custom legacy professional titles selectable',()=>{
  const html=renderToStaticMarkup(createElement(RoleSelect,{locale:'en',value:'Custom legacy role',onChange:()=>{}}));
  expect(html).toContain('value="Custom legacy role"');
 });
 it('offers detailed fields alongside sectors and preserves stored custom values',()=>{
  const html=renderToStaticMarkup(createElement(FieldSelect,{locale:'en',value:['Custom field'],onChange:()=>{}}));
  expect(html).toContain('Motion Designer');expect(html).toContain('Front-end Developer');expect(html).toContain('Custom field');
 });
 it('localizes detailed fields in Arabic and enforces the backend selection limit',()=>{
  const html=renderToStaticMarkup(createElement(FieldSelect,{locale:'ar',value:roles.slice(0,30).map(r=>r.en),onChange:()=>{}}));
  expect(html).toContain('مصمم موشن جرافيك');expect(html).toMatch(/aria-pressed="false" disabled=""/);
 });
});
