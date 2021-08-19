const { UserBlockedPostAnonymous } = require("../../databases/models");
const { getValue, setValue } = require("../redis");
module.exports = async (userId) => {
  try {
    // let key = `${userId}-anonymous`;
    // let cache = await getValue(key);
    // console.log(cache);
    // if (cache === null || cache === false) {
    //   console.log('from database post anonymous');
    //   let blockPost = await UserBlockedPostAnonymous.findAll({
    //     attributes: ['post_anonymous_id_blocked'],
    //     where: {
    //       user_id_blocker: userId,
    //     },
    //   });
    //   let userBlock = await JSON.stringify(blockPost);
    //   await setValue(key, userBlock);
    //   return blockPost;
    // } else {
    //   console.log('from cache post anonymous');
    //   return await JSON.parse(cache);
    // }
    let blockUser = await UserBlockedPostAnonymous.findAll({
      attributes: ["post_anonymous_id_blocked"],
      where: {
        user_id_blocker: userId,
      },
    });
    return blockUser;
  } catch (error) {
    throw error;
  }
};
