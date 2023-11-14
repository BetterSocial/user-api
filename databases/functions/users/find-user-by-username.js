/**
 *
 * @param {import('sequelize').Model} userModel
 * @param {String} username
 */
const findUserByUsername = async (userModel, username) => {
  if (!username) throw new Error('username is required');
  const user = await userModel.findOne({
    where: {
      username
    },
    raw: true
  });

  return user;
};

module.exports = findUserByUsername;
