import EditJobScreen from '../app/customer/edit-job';

describe('Customer Edit Job module', () => {
  test('loads without throwing and default export is a function', () => {
    expect(typeof EditJobScreen).toBe('function');
  });
});
