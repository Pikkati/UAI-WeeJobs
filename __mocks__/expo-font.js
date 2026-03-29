const isJest = typeof jest !== 'undefined' && typeof jest.fn === 'function';
const useFonts = isJest ? jest.fn(() => [true]) : () => [true];

module.exports = { useFonts };
