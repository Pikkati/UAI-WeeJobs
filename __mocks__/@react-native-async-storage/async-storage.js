const storage = Object.create(null);

module.exports = {
  setItem: async (key, value) => {
    storage[key] = String(value);
    return Promise.resolve();
  },
  getItem: async (key) => {
    return Promise.resolve(Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null);
  },
  removeItem: async (key) => {
    delete storage[key];
    return Promise.resolve();
  },
  clear: async () => {
    for (const k of Object.keys(storage)) delete storage[k];
    return Promise.resolve();
  },
};
