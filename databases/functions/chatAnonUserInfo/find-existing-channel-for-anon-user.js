const findExistingChannelForAnonUser = async (model, target_user_id, userId) => {
  try {
    const anonUserInfo = await model.findOne({
      where: {
        target_user_id: target_user_id,
        my_anon_user_id: userId
      },
      raw: true
    });

    return anonUserInfo;
  } catch (e) {
    console.debug(e);
    return null;
  }
};

module.exports = findExistingChannelForAnonUser;
