
// jest.mock('createReaction');

const createReaction = require('./createReaction');


test('create Reaction works well', async () => {
    await createReaction("token","activity-id", "message is here", "kind");


});
