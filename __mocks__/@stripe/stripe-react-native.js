// Minimal mock for @stripe/stripe-react-native used in tests.
module.exports = {
  useStripe: () => ({
    initPaymentSheet: async () => ({ error: null }),
    presentPaymentSheet: async () => ({ error: null }),
  }),
  StripeProvider: ({ children }) => children,
};
