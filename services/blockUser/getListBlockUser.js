const { UserBlockedUser } = require("../../databases/models");
const { getValue, setValue } = require("../redis");
module.exports = async (userId) => {
  try {
    // let cache = await getValue(userId);
    // console.log(cache);
    // if (cache === null || cache === false) {
    //   console.log("from database");
    //   let blockUser = await UserBlockedUser.findAll({
    //     attributes: ["user_id_blocked"],
    //     where: {
    //       user_id_blocker: userId,
    //     },
    //   });
    //   let userBlock = await JSON.stringify(blockUser);
    //   await setValue(userId, userBlock);
    //   return blockUser;
    // } else {
    //   console.log("from cache");
    //   return await JSON.parse(cache);
    // }
    let blockUser = await UserBlockedUser.findAll({
      attributes: ["user_id_blocked"],
      where: {
        user_id_blocker: userId,
      },
    });
    return blockUser;
  } catch (error) {
    throw error;
  }
};
