const deleteFeed = require('./deleteFeed');

test('create Comment Child', async () => {
  await deleteFeed(
    'XRT0XKwzedFMVzUZkcuJROk9Le3VGVj0',
    'example_feed',
    '4fb669a3-06b4-45cc-93b6-41e1336f5103'
  );
});
