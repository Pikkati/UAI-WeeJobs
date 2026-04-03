import { computeBudgetValue, validateEditJobFields } from '../app/customer/edit-job';

describe('computeBudgetValue', () => {
  it('returns Need Quotation when needsQuotation is true', () => {
    expect(computeBudgetValue(true, '200')).toBe('Need Quotation');
  });

  it('returns formatted budget when provided', () => {
    expect(computeBudgetValue(false, '150')).toBe('£150');
  });

  it('returns null when no budget and not quotation', () => {
    expect(computeBudgetValue(false, '')).toBeNull();
    expect(computeBudgetValue(false, undefined)).toBeNull();
  });
});

describe('validateEditJobFields', () => {
  const base = {
    name: 'Test',
    phone: '012345',
    area: 'Area',
    category: 'Some',
    timing: 'ASAP',
    isGarageClearance: false,
    photos: [],
  } as any;

  it('fails when a required field is missing', () => {
    const bad = { ...base, name: '' };
    const res = validateEditJobFields(bad);
    expect(res.valid).toBe(false);
    expect(res.title).toMatch(/Required Fields/i);
  });

  it('requires a photo for garage clearance', () => {
    const bad = { ...base, category: 'Garage Clearance', isGarageClearance: true, photos: [] };
    const res = validateEditJobFields(bad);
    expect(res.valid).toBe(false);
    expect(res.title).toMatch(/Photo Required/i);
  });

  it('returns valid for proper input', () => {
    const ok = { ...base, photos: ['a.jpg'] };
    const res = validateEditJobFields(ok);
    expect(res.valid).toBe(true);
  });
});

