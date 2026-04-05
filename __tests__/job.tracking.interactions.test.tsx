import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Top-level mock fns and fixtures so mocks register before modules are required.
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockMarkOnTheWay = jest.fn(async () => true);
const mockMarkArrived = jest.fn(async () => true);
const mockConfirmCompletion = jest.fn(async () => true);
const mockCancelJob = jest.fn(async () => true);

const mockJob = {
  id: 'job1',
  status: 'booked',
  pricing_type: 'fixed',
  category: 'plumbing',
  area: 'Test Area',
  deposit_amount: 0,
  deposit_paid: false,
  tradie_confirmed: false,
  customer_confirmed: false,
  quote_total: 100,
  timing: 'ASAP',
  photos: [],
};

const actions = [
  { action: 'message', label: 'Message', variant: 'primary' },
  {
    action: 'start_navigation',
    label: 'Start navigation',
    variant: 'secondary',
  },
];

jest.mock(
  'expo-router',
  () => ({
    useLocalSearchParams: () => ({ jobId: 'job1' }),
    useRouter: () => ({ push: mockPush, back: mockBack }),
  }),
  { virtual: true },
);

jest.mock(
  'react-native-safe-area-context',
  () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }),
  { virtual: true },
);

jest.mock(
  '../context/AuthContext',
  () => ({ useAuth: () => ({ user: { id: 'u1', role: 'customer' } }) }),
  { virtual: true },
);

jest.mock(
  '../context/JobsContext',
  () => ({
    useJobs: () => ({
      jobs: [mockJob],
      getNextActionsByRole: () => actions,
      markOnTheWay: mockMarkOnTheWay,
      markArrived: mockMarkArrived,
      confirmCompletion: mockConfirmCompletion,
      cancelJob: mockCancelJob,
    }),
  }),
  { virtual: true },
);

// Provide a test-time fallback so useJobs() works even if JobsContext was
// imported earlier by other tests. Cleaned up in afterEach to avoid leaking.
(global as any).__TEST_USE_JOBS__ = () => ({
  jobs: [mockJob],
  getNextActionsByRole: () => actions,
  markOnTheWay: mockMarkOnTheWay,
  markArrived: mockMarkArrived,
  confirmCompletion: mockConfirmCompletion,
  cancelJob: mockCancelJob,
  loading: false,
  fetchJobs: async () => {},
  fetchInterests: async () => [],
  expressInterest: async () => false,
  closeApplications: async () => false,
  selectTradesman: async () => false,
  payDeposit: async () => ({
    paymentIntent: '',
    ephemeralKey: '',
    customer: '',
    merchantDisplayName: 'WeeJobs',
  }),
  sendEstimate: async () => false,
  acknowledgeEstimate: async () => false,
  sendQuote: async () => false,
  approveQuote: async () => false,
  sendInvoice: async () => false,
  payInvoice: async () => ({ ok: true, id: 'pi' }),
  payFinalBalance: async () => ({ ok: true, id: 'pi_final' }),
  calculateDeposit: () => 20,
  refreshJobs: () => {},
});

describe('JobTrackingScreen interactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    try {
      // remove the test fallback so other tests aren't affected
      delete (global as any).__TEST_USE_JOBS__;
    } catch {}
  });

  it('renders and triggers message and navigation actions', async () => {
    const JobTrackingScreen = require('../app/job/tracking').default;

    const { getByText } = render(<JobTrackingScreen />);

    // Header rendered
    expect(getByText('Job Tracking')).toBeTruthy();

    // Message button triggers router push
    const msgBtn = getByText('Message');
    fireEvent.press(msgBtn);
    expect(mockPush).toHaveBeenCalledWith('/chat/job1');

    // Start navigation triggers markOnTheWay
    const navBtn = getByText('Start navigation');
    fireEvent.press(navBtn);

    await waitFor(() => {
      expect(mockMarkOnTheWay).toHaveBeenCalledWith('job1');
    });
  });
});
