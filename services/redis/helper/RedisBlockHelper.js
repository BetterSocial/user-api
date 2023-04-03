const { delCache } = require("..");
const { BLOCK_FEED_KEY } = require("../../../helpers/constants");

const resetBlockUserList = async(userId) => {
    return delCache(BLOCK_FEED_KEY + userId);
}

const RedisBlockHelper = {
    resetBlockUserList
}

module.exports = RedisBlockHelper