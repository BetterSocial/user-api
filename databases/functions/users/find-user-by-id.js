/**
 *
 * @param {import('sequelize').Model} userModel
 * @param {String} userId
 */
const findUserById = async (userModel, userId) => {
  if (!userId) throw new Error('User id is required');
  const user = await userModel.findOne({
    where: {
      user_id: userId
    },
    raw: true
  });

  return user;
};

module.exports = findUserById;
