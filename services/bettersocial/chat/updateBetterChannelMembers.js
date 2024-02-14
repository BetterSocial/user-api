const _ = require('lodash');

const UsersFunction = require('../../../databases/functions/users');
const {sequelize} = require('../../../databases/models');
const BetterSocialConstantListUtils = require('../../../services/bettersocial/constantList/utils');

const SEPARATOR = ', ';

/**
 * @typedef {Object} UpdateBetterChannelMember
 * @property {import('stream-chat').ChannelMember[]} betterChannelMember
 * @property {string} newChannelName
 * @property {Object} betterChannelMemberObject
 */

/**
 *
 * @param {import('stream-chat').Channel} chatChannel
 * @param {import("stream-chat").ChannelAPIResponse} channel
 * @param {Partial<import("stream-chat").ChannelResponse>} additionalUpdateData
 * @returns {Promise<UpdateBetterChannelMember>}
 */
const updateBetterChannelMembers = async (
  chatChannel,
  channel,
  withUpdate = false,
  additionalUpdateData = {}
) => {
  if (!chatChannel) throw new Error('Chat Channel is required');
  if (!channel) throw new Error('Channel is required');

  const {members} = channel;

  const membersIds = members.map((member) => member.user_id);

  const membersDataFromDb = await UsersFunction.getAllChatAnonimityUserInfo(
    sequelize,
    channel?.channel?.id,
    membersIds
  );

  const membersDataFromDbMap = _.keyBy(membersDataFromDb, 'user_id');

  let {better_channel_member, new_channel_name} = __helperProcessBetterChannelMember(
    members,
    membersDataFromDbMap
  );

  const checkedChannelName = channel?.channel?.is_name_custom
    ? channel?.channel?.name
    : new_channel_name;

  const defaultUpdateData = {
    better_channel_member,
    name: checkedChannelName,
    ...additionalUpdateData
  };

  if (withUpdate) {
    try {
      await chatChannel.updatePartial({
        set: defaultUpdateData
      });
    } catch (e) {
      console.error('Failed to update channel', e);
    }
  }

  return {
    betterChannelMember: better_channel_member,
    newChannelName: checkedChannelName,
    betterChannelMemberObject: _.keyBy(better_channel_member, 'user_id')
  };
};

const __getAnonUserInfoPriority = (memberDataFromDb, member) => {
  if (memberDataFromDb.anon_user_info_color_code) {
    return {
      color_name: memberDataFromDb.anon_user_info_color_name,
      color_code: memberDataFromDb.anon_user_info_color_code,
      emoji_name: memberDataFromDb.anon_user_info_emoji_name,
      emoji_code: memberDataFromDb.anon_user_info_emoji_code
    };
  } else if (member.anon_user_info_color_code) {
    return {
      color_name: member.anon_user_info_color_name,
      color_code: member.anon_user_info_color_code,
      emoji_name: member.anon_user_info_emoji_name,
      emoji_code: member.anon_user_info_emoji_code
    };
  } else {
    const emoji = BetterSocialConstantListUtils.getRandomEmoji();
    const color = BetterSocialConstantListUtils.getRandomColor();
    return {
      color_name: color.color,
      color_code: color.code,
      emoji_name: emoji.name,
      emoji_code: emoji.emoji
    };
  }
};

const __helperProcessBetterChannelMember = (members, membersDataFromDbMap) => {
  let newChannelName = '';
  const better_channel_member = members.map((member) => {
    const memberDataFromDb = membersDataFromDbMap[member.user_id];

    if (!memberDataFromDb) return member;
    const {is_anonymous, username, anon_user_info_emoji_name} = memberDataFromDb;

    const updatedUsername = is_anonymous ? `Anonymous ${anon_user_info_emoji_name}` : username;

    newChannelName += `${updatedUsername}${SEPARATOR}`;

    const defaultUser = {
      ...member,
      is_anonymous,
      user: {
        ...member.user,
        is_anonymous: is_anonymous,
        username: updatedUsername,
        name: updatedUsername
      }
    };

    if (is_anonymous) {
      defaultUser.is_anonymous = is_anonymous;
      let anon_user_info = __getAnonUserInfoPriority(memberDataFromDb, member);
      defaultUser.anon_user_info_color_name = anon_user_info.color_name;
      defaultUser.anon_user_info_color_code = anon_user_info.color_code;
      defaultUser.anon_user_info_emoji_name = anon_user_info.emoji_name;
      defaultUser.anon_user_info_emoji_code = anon_user_info.emoji_code;
    }

    return defaultUser;
  });

  return {
    better_channel_member,
    new_channel_name: newChannelName.slice(0, -SEPARATOR.length)
  };
};

module.exports = updateBetterChannelMembers;
