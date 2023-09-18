const createUser = require('./createUser');

test('createUser works well', async () => {
  const data = {
    name: 'User'
  };
  const userId = '123';
  await createUser(data, userId);

  const dataError = {
    name: 'U'
  };
  await createUser(dataError, userId);
});
