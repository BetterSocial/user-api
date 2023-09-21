const {UserBlockedPostAnonymous} = require('../../databases/models');
const {getIdBlockAnonymousAuthor} = require('../../utils/block');
const {getValue, setValue, delCache} = require('../redis');
module.exports = async (userId) => {
  try {
    let blockPost = await UserBlockedPostAnonymous.findAll({
      attributes: ['post_anonymous_author_id'],
      where: {
        user_id_blocker: userId
      }
    });
    let userBlock = await JSON.stringify(blockPost);
    return blockPost;
  } catch (error) {
    throw error;
  }
};
