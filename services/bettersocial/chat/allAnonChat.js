const {User, ChatAnonUserInfo} = require('../../../databases/models');
const {Op} = require('sequelize');
const crypto = require('crypto');
const BetterSocialConstantListUtils = require('../constantList/utils');

const generate_channel_id_for_anon_chat = (owner, member, context = null) => {
  const hash = crypto.createHash('sha256');
  hash.update(owner);
  hash.update(member);
  hash.update(context);
  return hash.digest('hex');
};

const is_all_anon_user = async (members) => {
  // check all members users are anonymous
  let users = await User.findAll({
    where: {
      user_id: {
        [Op.in]: members
      },
      is_anonymous: false
    }
  });
  return users.length === 0 ? true : false;
};

const generate_anon_user_info = () => {
  const emoji = BetterSocialConstantListUtils.getRandomEmoji();
  const color = BetterSocialConstantListUtils.getRandomColor();
  return {
    anon_user_info_color_code: color.code,
    anon_user_info_color_name: color.color,
    anon_user_info_emoji_code: emoji.emoji,
    anon_user_info_emoji_name: emoji.name
  };
};

const get_anon_info_from_old_channel = async (oldChannelId, member) => {
  let anonInfo = {};
  if (oldChannelId) {
    let previous_channel = await ChatAnonUserInfo.findOne({
      where: {
        channel_id: oldChannelId,
        my_anon_user_id: member
      }
    });
    anonInfo = {
      anon_user_info_color_code: previous_channel.anon_user_info_color_code,
      anon_user_info_color_name: previous_channel.anon_user_info_color_name,
      anon_user_info_emoji_code: previous_channel.anon_user_info_emoji_code,
      anon_user_info_emoji_name: previous_channel.anon_user_info_emoji_name
    };
  } else {
    anonInfo = generate_anon_user_info();
  }
  return anonInfo;
};

const handle_anon_to_anon_channel_owner = async (owner, member, context = null) => {
  // check if channel already exist
  let channel = await ChatAnonUserInfo.findOne({
    where: {
      my_anon_user_id: owner,
      target_user_id: member,
      context: context,
      initiator: owner
    }
  });
  if (channel) {
    return channel;
  } else {
    // handle to create new channel if not exist
    // generate channel id
    let channel_id = generate_channel_id_for_anon_chat(owner, member, context);
    const emoji = BetterSocialConstantListUtils.getRandomEmoji();
    const color = BetterSocialConstantListUtils.getRandomColor();
    let new_channel = await ChatAnonUserInfo.create({
      channel_id: channel_id,
      my_anon_user_id: owner,
      target_user_id: member,
      anon_user_info_color_code: color.code,
      anon_user_info_color_name: color.color,
      anon_user_info_emoji_code: emoji.emoji,
      anon_user_info_emoji_name: emoji.name,
      context: context,
      initiator: owner
    });
    return new_channel;
  }
};

const handle_anon_to_anon_channel_member = async (
  channel_owner,
  member,
  oldChannelId,
  context = null
) => {
  // check if channel already exist
  let channel = await ChatAnonUserInfo.findOne({
    where: {
      my_anon_user_id: member,
      target_user_id: channel_owner.my_anon_user_id,
      context: context,
      initiator: channel_owner.my_anon_user_id
    }
  });
  if (channel) {
    return channel;
  } else {
    // get anon info from old channel or generate a new one
    let anonInfo = await get_anon_info_from_old_channel(oldChannelId, member);
    let new_channel = await ChatAnonUserInfo.create({
      channel_id: channel_owner.channel_id,
      my_anon_user_id: member,
      target_user_id: channel_owner.my_anon_user_id,
      anon_user_info_color_code: anonInfo.anon_user_info_color_code,
      anon_user_info_color_name: anonInfo.anon_user_info_color_name,
      anon_user_info_emoji_code: anonInfo.anon_user_info_emoji_code,
      anon_user_info_emoji_name: anonInfo.anon_user_info_emoji_name,
      context: context,
      initiator: channel_owner.my_anon_user_id
    });
    return new_channel;
  }
};

module.exports = {
  is_all_anon_user,
  handle_anon_to_anon_channel_owner,
  handle_anon_to_anon_channel_member
};
