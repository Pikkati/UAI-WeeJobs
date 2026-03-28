const openBrowserAsync = jest.fn(async (url) => ({ type: 'opened', url }));

module.exports = {
  openBrowserAsync,
};
