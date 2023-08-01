const {v4: uuid} = require('uuid');

const createChatAnonUserInfo = async (
  chatAnonUserInfoModel,
  channel_id,
  my_anon_user_id,
  target_user_id,
  anonUserInfo
) => {
  try {
    const chatAnonUserInfo = await chatAnonUserInfoModel.create({
      chat_id: uuid(),
      channel_id,
      my_anon_user_id,
      target_user_id,
      anon_user_info_color_code: anonUserInfo.anon_user_info_color_code,
      anon_user_info_color_name: anonUserInfo.anon_user_info_color_name,
      anon_user_info_emoji_code: anonUserInfo.anon_user_info_emoji_code,
      anon_user_info_emoji_name: anonUserInfo.anon_user_info_emoji_name,
      created_at: new Date(),
      updated_at: new Date()
    });
    return Promise.resolve(chatAnonUserInfo);
  } catch (e) {
    console.log(e);
    return Promise.reject(e);
  }
};

module.exports = createChatAnonUserInfo;
