const findAnonUserInfo = async (model, channelId, userId) => {
  try {
    const anonUserInfo = await model.findOne({
      where: {
        channel_id: channelId,
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

module.exports = findAnonUserInfo;
