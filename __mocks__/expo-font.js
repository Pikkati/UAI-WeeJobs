<<<<<<< HEAD
const isJest = typeof jest !== 'undefined' && typeof jest.fn === 'function';
const useFonts = isJest ? jest.fn(() => [true]) : () => [true];

module.exports = { useFonts };
=======
const isJest = typeof jest !== 'undefined' && typeof jest.fn === 'function';
const useFonts = isJest ? jest.fn(() => [true]) : () => [true];

module.exports = { useFonts };
>>>>>>> 5b2d6a4 (test: add chainable supabase mock, Expo mocks, smoke harness, and test setup tweaks)
