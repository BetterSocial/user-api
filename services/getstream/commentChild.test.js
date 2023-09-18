const commentChild = require('./commentChild');

test('create Comment Child', async () => {
  await commentChild(
    '05bafac3-36ea-4642-8391-65364d15322c',
    'this_is_child_comment',
    'bba1KFvucUhH007068WQrfrNYv7Wb4dt'
  );
});
