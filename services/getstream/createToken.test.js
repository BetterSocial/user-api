// jest.mock('createToken');

const TestConstants = require('../../__tests__/api/__utils__/constant');
const createToken = require('./createToken');

test('create Token works well', async () => {
  const userId = TestConstants.MY_USER_ID;
  await createToken(userId);
});
