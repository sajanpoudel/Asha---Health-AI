import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('skips falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('accepts conditional objects', () => {
    expect(cn('a', { b: true, c: false })).toBe('a b');
  });

  it('lets the last tailwind class win', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
