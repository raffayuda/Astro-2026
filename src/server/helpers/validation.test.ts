import { describe, expect, it } from 'bun:test';
import { formatZodError } from '@/src/server/helpers/validation';

describe('formatZodError', () => {
  it('formats a single field error with path and message', () => {
    const err = { error: [{ path: '/title', message: 'Judul wajib diisi' }] };
    expect(formatZodError(err)).toBe('title: Judul wajib diisi');
  });

  it('joins multiple field errors with semicolons', () => {
    const err = {
      error: [
        { path: '/title', message: 'Judul wajib diisi' },
        { path: '/category', message: 'Kategori wajib diisi' },
      ],
    };
    expect(formatZodError(err)).toBe('title: Judul wajib diisi; category: Kategori wajib diisi');
  });

  it('formats array paths with dot notation', () => {
    const err = {
      error: [{ path: ['prizes', 0, 'label'], message: 'Label hadiah wajib diisi' }],
    };
    expect(formatZodError(err)).toBe('prizes.0.label: Label hadiah wajib diisi');
  });

  it('ignores generic TypeBox messages in favor of schema errorMessage', () => {
    const err = {
      error: [{ path: '/fee', message: 'Invalid value', schema: { errorMessage: 'Biaya tidak boleh negatif' } }],
    };
    expect(formatZodError(err)).toBe('fee: Biaya tidak boleh negatif');
  });

  it('falls back to a default message for unknown issues', () => {
    const err = { error: [{ path: '/x', message: 'Invalid value' }] };
    expect(formatZodError(err)).toBe('x: nilai tidak valid');
  });

  it('falls back to err.message when no error array exists', () => {
    expect(formatZodError({ message: 'Something broke' })).toBe('Something broke');
    expect(formatZodError({})).toBe('Validation failed');
  });

  it('handles the real Elysia validation error shape (errors + property)', () => {
    const err = {
      type: 'validation',
      on: 'body',
      property: 'isActive',
      message: 'Invalid input: expected boolean, received string',
      errors: [
        {
          expected: 'boolean',
          code: 'invalid_type',
          path: ['isActive'],
          message: 'Invalid input: expected boolean, received string',
        },
      ],
    };
    expect(formatZodError(err)).toBe('isActive: harus berupa boolean');
  });

  it('parses the stringified JSON blob Elysia returns inside error', () => {
    const blob = JSON.stringify({
      type: 'validation',
      on: 'body',
      property: 'isActive',
      message: 'Invalid input: expected boolean, received string',
      errors: [
        {
          expected: 'boolean',
          code: 'invalid_type',
          path: ['isActive'],
          message: 'Invalid input: expected boolean, received string',
        },
      ],
    });
    expect(formatZodError(blob)).toBe('isActive: harus berupa boolean');
  });

  it('handles the Elysia ValidationError instance (Error with JSON message)', () => {
    const blob = JSON.stringify({
      type: 'validation',
      on: 'body',
      property: 'isActive',
      message: 'Invalid input: expected boolean, received string',
      errors: [
        {
          expected: 'boolean',
          code: 'invalid_type',
          path: ['isActive'],
          message: 'Invalid input: expected boolean, received string',
        },
      ],
    });
    const fakeErr = new Error(blob);
    expect(formatZodError(fakeErr)).toBe('isActive: harus berupa boolean');
  });

  it('translates a missing required string field (real Elysia shape)', () => {
    const err = {
      errors: [{ path: ['title'], message: 'Invalid input: expected string, received undefined' }],
    };
    expect(formatZodError(err)).toBe('title: wajib diisi');
  });

  it('translates a number-format issue', () => {
    const err = {
      errors: [{ path: ['fee'], message: 'Invalid input: expected number, received string' }],
    };
    expect(formatZodError(err)).toBe('fee: harus berupa angka');
  });
});
