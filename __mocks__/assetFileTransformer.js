// Minimal asset transformer for Jest to replace binary assets with their filename
module.exports = {
  process(src, filename) {
    return `module.exports = ${JSON.stringify(filename)};`;
  },
};
