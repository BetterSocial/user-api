
const createReaction = require('./createReaction');


test('create Reaction works well', async () => {
    await createReaction(
        "wjDpZtcDClWrlLpsgUVuVz4fw0HzrTHO",
        "a9d933ac-985c-4900-9a0b-44a7bdc97042",
        "message is here",
        "createReaction-action");


});
