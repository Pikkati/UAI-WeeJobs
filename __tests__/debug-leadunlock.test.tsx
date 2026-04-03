import LeadUnlockModal from '../components/LeadUnlockModal';

describe('debug LeadUnlockModal import', () => {
  it('logs the imported value', () => {
    // eslint-disable-next-line no-console
    console.log('LeadUnlockModal value:', LeadUnlockModal);
    expect(LeadUnlockModal).toBeDefined();
  });
});
