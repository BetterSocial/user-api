module.exports = async (userModel, anonymousUsername) => {
  const anonymousUser = await userModel.findOne({
    where: {
      username: anonymousUsername
    },
    raw: true
  });

  return anonymousUser;
};
