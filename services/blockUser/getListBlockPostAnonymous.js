const { UserBlockedPostAnonymous } = require('../../databases/models');
const { BLOCK_POST_ANONYMOUS } = require('../../helpers/constants');
const { getValue, setValue, delCache } = require('../redis');
module.exports = async (userId) => {
  try {
    let KEY = BLOCK_POST_ANONYMOUS + userId;
    let cache = await getValue(KEY);
    if (cache === null || cache === false) {
      let blockPost = await UserBlockedPostAnonymous.findAll({
        attributes: ['post_anonymous_id_blocked'],
        where: {
          user_id_blocker: userId,
        },
      });
      let userBlock = await JSON.stringify(blockPost);
      await setValue(KEY, userBlock);
      return blockPost;
    } else {
      return await JSON.parse(cache);
    }
    // let blockUser = await UserBlockedPostAnonymous.findAll({
    //   attributes: ["user_id_blocked"],
    //   where: {
    //     user_id_blocker: userId,
    //   },
    // });
    return blockUser;
  } catch (error) {
    throw error;
  }
};
