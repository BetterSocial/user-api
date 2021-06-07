const { UserBlockedUser } = require("../../databases/models");
module.exports = async (userId) => {
  // ambil semua list data user yang di block dari server
  // kembalikan semua data
  console.log(userId);
  return await UserBlockedUser.findAll({
    attributes: ["user_id_blocked"],
    where: {
      user_id_blocker: userId,
    },
  });
};
