// Mock for TurboModuleRegistry
console.log('Mocking TurboModuleRegistry');
module.exports = {
  get: jest.fn(() => {
    console.log('TurboModuleRegistry.get called');
    return {};
  }),
  getEnforcing: jest.fn(() => {
    console.log('TurboModuleRegistry.getEnforcing called');
    return {
      getConstants: jest.fn(() => {
        console.log('TurboModuleRegistry.getConstants called');
        return {};
      }),
    };
  }),
};