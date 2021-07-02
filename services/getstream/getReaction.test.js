
const getReaction = require('./getReaction');


test('create getReaction', async () => {
    await getReaction(
        "b728e733-b235-4b62-a595-1a1ff4180162",
        "YBkHeAGw4csFZfmnCK4Cegoa6DYRav50"
    );

});

test('create failed getReaction', async () => {
   await getReaction(
        "b728e733-4b62-a595-1a1ff4180162",
        "YBkHeAGw4csFZfmnCK4Cegoa6DYRav50"
    );

});
