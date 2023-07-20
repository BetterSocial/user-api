/**
 *
 * @param {import('sequelize').Model} userModel
 * @param {String} userId
 */
const findMultipleUserById = async (userModel, userIds = []) => {
  if (userIds.length === 0) throw new Error('User ids cannot be empty');
  const user = await userModel.findAll({
    where: {
      user_id: userIds
    },
    raw: true
  });

  return user;
};

module.exports = findMultipleUserById;
