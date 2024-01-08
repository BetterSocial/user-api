/**
 *
 * @param {import('sequelize').Model} userModel
 * @param {String} userId
 */
const getUsersKarmaScore = async (userModel, userIds = []) => {
  if (userIds.length === 0) return [];
  const users = await userModel.findAll({
    where: {
      user_id: userIds
    },
    attributes: ['user_id', 'karma_score'],
    raw: true
  });

  return users;
};

module.exports = getUsersKarmaScore;
