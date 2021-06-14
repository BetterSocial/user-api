
// jest.mock('createToken');

const createToken = require('./createToken');


test('create Token works well', async () => {
    const userId = "d24f6c17-f20e-4cc9-8df1-45f1fa4dcf52";
    await createToken(userId);

});

//uncomment to display failed Test
// test('create Token failed - different sample Id', async () => {
//     const userId = "d24f6c17";
//     await createToken(userId);
//
// });
