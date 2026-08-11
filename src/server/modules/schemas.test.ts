import { describe, expect, it } from 'bun:test';
import { competitionInputSchema, prizeSchema, timelineItemSchema } from '@/src/server/modules/competitions/model';
import { registrationCreateSchema } from '@/src/server/modules/registrations/model';

describe('competitionInputSchema', () => {
  const valid = {
    id: 'lomba-1',
    title: 'Lomba Matematika',
    category: 'akademik',
  };

  it('accepts a minimal valid payload', () => {
    const result = competitionInputSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects a missing title', () => {
    const result = competitionInputSchema.safeParse({ category: 'akademik' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['title']);
    }
  });

  it('rejects empty prizes with a clean message', () => {
    const result = competitionInputSchema.safeParse({
      ...valid,
      prizes: [{ label: '', value: '12000' }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join('|');
      expect(msg).toContain('Label hadiah wajib diisi');
    }
  });

  it('rejects invalid type enum', () => {
    const result = competitionInputSchema.safeParse({ ...valid, type: 'solo' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tipe lomba tidak valid');
    }
  });

  it('applies defaults for optional fields', () => {
    const result = competitionInputSchema.safeParse(valid);
    if (result.success) {
      expect(result.data.fee).toBe(0);
      expect(result.data.isFree).toBe(false);
      expect(result.data.prizes).toEqual([]);
    }
  });
});

describe('prizeSchema', () => {
  it('rejects empty label', () => {
    const result = prizeSchema.safeParse({ label: '', value: '12000' });
    expect(result.success).toBe(false);
  });
});

describe('timelineItemSchema', () => {
  it('rejects missing date', () => {
    const result = timelineItemSchema.safeParse({ title: 'x', desc: 'y' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(['date']);
  });

  it('accepts a valid item', () => {
    expect(timelineItemSchema.safeParse({ date: '1 Jan 2026', title: 'x', desc: 'y' }).success).toBe(true);
  });
});

describe('registrationCreateSchema', () => {
  const valid = {
    competitionId: 'lomba-1',
    type: 'individual',
    institution: 'SMA 1',
    email: 'a@b.com',
    whatsapp: '628123456789',
  };

  it('accepts a valid registration', () => {
    expect(registrationCreateSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = registrationCreateSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toBe('Format email tidak valid');
  });

  it('rejects missing institution', () => {
    const result = registrationCreateSchema.safeParse({ ...valid, institution: '' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toBe('Asal instansi wajib diisi');
  });
});
