import CustomerLayout from '../app/customer/_layout';

describe('Customer _layout module', () => {
  test('loads without throwing and default export is a function', () => {
    expect(typeof CustomerLayout).toBe('function');
  });
});
