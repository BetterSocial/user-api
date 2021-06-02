
jest.mock('getstream');

const createUser = require('./createUser');


test('createUser works well', async () => {
  const data = {
    name: "Kevin"
  };
  const userId = "123";
  await createUser(data, userId);

  const dataError = {
    name: "Kevinoo"
  };
  await createUser(dataError, userId);
});