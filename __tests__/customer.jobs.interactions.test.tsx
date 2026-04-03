import { getActionText } from '../app/customer/jobs.helpers';

describe('CustomerJobs interactions (logic-only)', () => {
  test('module loads as a function', () => {
    // simple module-load check (avoids rendering hooks)
    // eslint-disable-next-line global-require
    const mod = require('../app/customer/jobs');
    expect(typeof mod.default === 'function').toBeTruthy();
  });

  test('getActionText returns review hint for completed job', () => {
    const job: any = { id: 'j1', status: 'completed' };
    const txt = getActionText(job, {});
    expect(txt).toBe('Tap to leave a review');
  });

  test('getActionText shows interest banner when count > 0', () => {
    const job: any = { id: 'j1', status: 'open' };
    const txt = getActionText(job, { j1: 1 });
    expect(txt).toBe('Tap to view interested tradespeople');
  });
});
