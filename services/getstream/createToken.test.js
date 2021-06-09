
// jest.mock('createToken');

const createToken = require('./createToken');


test('create Token works well', async () => {
    const data = {
        name: "Kevin"
    };
    const userId = "123";
    await createToken(userId);

    // const dataError = {
    //     name: "Kev"
    // };
    // await createUser(dataError, userId);
});
