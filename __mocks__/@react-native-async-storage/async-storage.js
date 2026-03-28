const storage = Object.create(null);

module.exports = {
  getItem: jest.fn(async (key) => (Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null)),
  setItem: jest.fn(async (key, value) => { storage[key] = String(value); }),
  removeItem: jest.fn(async (key) => { delete storage[key]; }),
  clear: jest.fn(async () => { Object.keys(storage).forEach((k) => delete storage[k]); }),
};
