import {
  computeBudgetValue,
  validateEditJobFields,
} from '../app/customer/edit-job';

describe('EditJob helpers', () => {
  test('computeBudgetValue returns correct values', () => {
    expect(computeBudgetValue(true, '100')).toBe('Need Quotation');
    expect(computeBudgetValue(false, '100')).toBe('£100');
    expect(computeBudgetValue(false, '')).toBeNull();
    expect(computeBudgetValue(false, undefined)).toBeNull();
  });

  test('validateEditJobFields detects missing required fields', () => {
    const res = validateEditJobFields({
      name: '',
      phone: '',
      area: '',
      category: '',
      timing: '',
      isGarageClearance: false,
      photos: [],
    });
    expect(res.valid).toBe(false);
    expect(res.title).toBe('Required Fields');
  });

  test('validateEditJobFields requires a photo when garage clearance', () => {
    const res = validateEditJobFields({
      name: 'A',
      phone: 'P',
      area: 'X',
      category: 'Garage Clearance',
      timing: 'ASAP',
      isGarageClearance: true,
      photos: [],
    });
    expect(res.valid).toBe(false);
    expect(res.title).toBe('Photo Required');
  });

  test('validateEditJobFields returns valid when all conditions met', () => {
    const res = validateEditJobFields({
      name: 'A',
      phone: 'P',
      area: 'X',
      category: 'General',
      timing: 'ASAP',
      isGarageClearance: false,
      photos: [],
    });
    expect(res.valid).toBe(true);
  });
});
