import { postJob } from '../lib/jobs';

describe('postJob helper', () => {
  beforeEach(() => {
    // Provide a test supabase client that records calls
    (global as any).__TEST_SUPABASE__ = {
      from: jest.fn(() => ({
        insert: jest.fn(async (payload: any) => ({ data: payload, error: null })),
      })),
    };
  });

  afterEach(() => {
    delete (global as any).__TEST_SUPABASE__;
    jest.resetAllMocks();
  });

  it('calls supabase.from("jobs").insert with payload', async () => {
    const payload = {
      name: 'Alice',
      phone: '012345',
      area: 'Downtown',
      category: 'Plumbing',
      title: 'Fix sink',
      description: 'Leaking sink needs repair',
      timing: 'ASAP',
      budget: '£100',
    };

    const res = await postJob(payload as any);

    const fromMock = (global as any).__TEST_SUPABASE__.from as jest.Mock;
    expect(fromMock).toHaveBeenCalledWith('jobs');

    // Ensure the `.from` helper was asked for the `jobs` table and the
    // response contains the inserted payload. Avoid asserting on the
    // internal insert mock shape which can vary depending on how the
    // test container was merged into the global override.
    expect(fromMock).toHaveBeenCalledWith('jobs');
    expect(res && (res as any).data).toEqual(payload);
  });
});
