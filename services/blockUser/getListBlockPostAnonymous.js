const {UserBlockedPostAnonymous} = require('../../databases/models');
const {BLOCK_POST_ANONYMOUS} = require('../../helpers/constants');
const {getIdBlockAnonymous} = require('../../utils/block');
const {getValue, setValue, delCache} = require('../redis');
module.exports = async (userId) => {
  try {
    let KEY = getIdBlockAnonymous(userId);
    let cache = await getValue(KEY);
    if (cache === null || cache === false) {
      let blockPost = await UserBlockedPostAnonymous.findAll({
        attributes: ['post_anonymous_id_blocked'],
        where: {
          user_id_blocker: userId
        }
      });
      let userBlock = await JSON.stringify(blockPost);
      await setValue(KEY, userBlock);
      return blockPost;
    } else {
      return await JSON.parse(cache);
    }
  } catch (error) {
    throw error;
  }
};
