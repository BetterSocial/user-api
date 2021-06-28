
// jest.mock('createRefreshToken');

const createRefreshToken = require('./createRefreshToken');

test('test createRefreshToken', async () => {

     let refreshToken = await createRefreshToken("ead6092c-888e-4a04-91ba-01a593d4329e");

});
