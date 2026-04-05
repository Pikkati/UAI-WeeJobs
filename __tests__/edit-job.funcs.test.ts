import {
  computeBudgetValue,
  validateEditJobFields,
} from '../app/customer/edit-job';

describe('EditJob helpers', () => {
  test('computeBudgetValue returns Need Quotation when requested', () => {
    expect(computeBudgetValue(true, '100')).toBe('Need Quotation');
  });

  test('computeBudgetValue returns formatted budget when provided', () => {
    expect(computeBudgetValue(false, '150')).toBe('£150');
    expect(computeBudgetValue(false, '')).toBeNull();
    expect(computeBudgetValue(false, undefined)).toBeNull();
  });

  test('validateEditJobFields requires required fields', () => {
    const base = {
      name: 'A',
      phone: '123',
      area: 'Area',
      category: 'Cat',
      timing: 'Now',
      isGarageClearance: false,
      photos: [] as string[],
    };

    expect(validateEditJobFields(base).valid).toBe(true);

    const missing = { ...base, name: '' };
    const resMissing = validateEditJobFields(missing as any);
    expect(resMissing.valid).toBe(false);
    expect(resMissing.title).toBe('Required Fields');

    const garageNoPhotos = { ...base, isGarageClearance: true, photos: [] };
    const resGarage = validateEditJobFields(garageNoPhotos);
    expect(resGarage.valid).toBe(false);
    expect(resGarage.title).toBe('Photo Required');
  });
});
