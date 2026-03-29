import ChatScreen from '../app/chat/[jobId]';

describe('Chat [jobId] module', () => {
  test('loads without throwing and default export is a function', () => {
    expect(typeof ChatScreen).toBe('function');
  });
});
