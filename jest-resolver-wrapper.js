// Minimal wrapper to expose a resolver shape Jest expects (sync + async)
const jr = require('jest-resolve');
const sync = jr.default || jr.defaultResolver || jr;
const asyncFn =
  jr.defaultAsyncResolver || ((path) => Promise.resolve(sync(path)));
module.exports = {
  sync,
  async: asyncFn,
};
