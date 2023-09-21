const getFeeds = require('./getFeeds');

test('create getFeeds', async () => {
  await getFeeds('XRT0XKwzedFMVzUZkcuJROk9Le3VGVj0', 'example_feed', 'select_*_from_table');
});
