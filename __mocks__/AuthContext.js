module.exports = {
  AuthProvider: jest.fn(() => null),
  useAuth: jest.fn(() => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  })),
};