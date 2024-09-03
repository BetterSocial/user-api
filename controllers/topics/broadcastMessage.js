/* 
    Send message to all users who join a topic
*/
const momentTz = require('moment-timezone');
const {v4: uuidv4} = require('uuid');
const UsersFunction = require('../../databases/functions/users');
const {followTopicQueue} = require('../../services/redis/queue');
const {User, CommunityMessageFormat} = require('../../databases/models');

const sendMessageToQueue = async (user_id, topic_id, community_message_format_id, delay) => {
  const data = {
    user_id,
    topic_id,
    community_message_format_id
  };
  let currentTime = momentTz().tz('America/Los_Angeles');
  let requiredTime = momentTz().tz('America/Los_Angeles').add(delay, 'minutes');

  const diffTime = requiredTime.diff(currentTime, 'milliseconds');

  const options = {
    jobId: uuidv4(),
    removeOnComplete: true,
    delay: diffTime
  };
  try {
    await followTopicQueue.add(data, options);
  } catch (e) {
    console.log('error', e);
  }
};

module.exports = async (req, res) => {
  const {userId} = req;
  const {communityMessageFormatId, topicId, targetUserId, delay} = req.body;

  //   check if the the user is anonymous
  const detailTokenUser = await UsersFunction.findUserById(User, userId);
  if (!detailTokenUser) {
    return res.status(404).json({message: 'User not found'});
  }
  if (detailTokenUser.is_anonymous) {
    return res.status(403).json({message: 'Anonymous user cannot send message'});
  }
  // find community message format if defined
  if (communityMessageFormatId) {
    const communityMessageFormat = await CommunityMessageFormat.findByPk(communityMessageFormatId);
    if (!communityMessageFormat) {
      return res.status(404).json({message: 'Community message format not found'});
    }
    sendMessageToQueue(
      targetUserId,
      communityMessageFormat.topic_id,
      communityMessageFormatId,
      delay || communityMessageFormat.delay
    );
  } else if (topicId) {
    try {
      const communityMessageFormats = await CommunityMessageFormat.findAll({
        where: {topic_id: topicId, status: '1'}
      });
      if (communityMessageFormats && !detailTokenUser.is_anonymous) {
        for (const format of communityMessageFormats) {
          sendMessageToQueue(
            targetUserId,
            topicId,
            format.community_message_format_id,
            delay || format.delay
          );
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(404).json({message: 'Error while sending message'});
    }
  }
  // get list of user who follow the topic
  //   const users = await UserTopic.findAll({
  //     where: {
  //       topic_id: topicId
  //     }
  //   });
  return res.status(200).json({
    status: 'success',
    code: 200,
    data: 'message send to queue'
  });
};
