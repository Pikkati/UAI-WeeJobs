const openBrowserAsync = jest.fn(async (url) => ({ url }));

module.exports = { openBrowserAsync };
module.exports = {
  openBrowserAsync: async () => ({ type: 'opened' }),
};
