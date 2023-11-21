const {StreamChat} = require('stream-chat');
const Environment = require('../../config/environment');
const {CHANNEL_TYPE_STRING} = require('../../helpers/constants');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const {ResponseSuccess} = require('../../utils/Responses');
const UsersFunction = require('../../databases/functions/users');
const {User} = require('../../databases/models');
const _ = require('lodash');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const groupAddMembers = async (req, res) => {
  const {userId} = req;
  const {channel_id, members} = req.body;

  const filteredMembers = members.reduce(
    (acc, next) => {
      if (next === userId) return acc;

      acc?.[0]?.push({
        user_id: next,
        role: 'channel_moderator'
      });

      acc?.[1]?.push(next);

      return acc;
    },
    [[], []]
  );

  const [filteredMembersObject, filteredMembersId] = filteredMembers;

  if (filteredMembersId.length < 1) {
    return ErrorResponse.e400(res, 'You cannot add yourself to the group');
  }

  const client = new StreamChat(Environment.GETSTREAM_API_KEY, Environment.GETSTREAM_API_SECRET);

  const channel = await client.queryChannels({
    id: channel_id,
    type: CHANNEL_TYPE_STRING.GROUP,
    members: {$in: [userId]}
  });

  if (channel?.length < 1) {
    return ErrorResponse.e404(res, 'Group not found');
  }

  const channelMembers = [userId, ...filteredMembersId];
  const channelToAdd = await client.channel(CHANNEL_TYPE_STRING.GROUP, channel_id, {
    members: channelMembers
  });

  const queryChannels = await client.queryChannels({
    type: CHANNEL_TYPE_STRING.GROUP,
    members: {$in: [userId]},
    id: channel_id
  });

  const queriedChannel = await queryChannels[0]?.create();

  const allMembersId = queriedChannel?.members?.map((member) => member?.user_id) || [];

  const membersFromDb = await UsersFunction.findMultipleUsersById(
    User,
    _.uniq([...allMembersId, ...filteredMembersId])
  );
  const newGroupName = membersFromDb.map((member) => member.username).join(', ');

  try {
    await channelToAdd?.update({
      name: newGroupName
    });
  } catch (e) {
    console.error('Failed to update group name');
  }

  try {
    await channelToAdd?.addMembers(filteredMembersObject);

    return ResponseSuccess(res, 'New members have been added to the group', 200, {
      ...queriedChannel,
      name: newGroupName
    });
  } catch (e) {
    console.log(e);
    return ErrorResponse.e400(res, e.message);
  }
};

module.exports = groupAddMembers;
