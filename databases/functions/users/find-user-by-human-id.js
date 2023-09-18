/**
 *
 * @param {import('sequelize').Model} userModel
 * @param {String} userId
 */
const findUserByHumanId = async (userModel, humanId) => {
  if (!humanId) throw new Error('Human ID is required');
  const user = await userModel.findOne({
    where: {
      human_id: humanId,
      is_anonymous: false
    },
    raw: true
  });

  return user;
};

module.exports = findUserByHumanId;
