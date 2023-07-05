const moment = require('moment');
const UsersFunction = require('../../databases/functions/users');
const {UserBlockedUser, User} = require('../../databases/models');
const getstreamService = require('../../services/getstream');
const {
  mappingFeed,
  countLevel2,
  countCommentLv3,
  finalize,
  getDetail,
  pushToa,
  getFeedGroup
} = require('./getFeedChat');

const getAnonymousFeedChatService = async (req, res) => {
  try {
    const mySignedId = await UsersFunction.findSignedUserId(User, req.userId);
    const data = await getstreamService.notificationGetNewFeed(req.userId, req.token);
    const newFeed = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const feeds of data.results) {
      const mapping = mappingFeed(req, feeds);
      newFeed.push(...mapping);
    }
    const newGroup = {};
    const groupingFeed = newFeed.reduce((a, b, index) => {
      const localDate = moment.utc(b.time).local().format();
      const {
        activity_id,
        expired_at,
        childComment,
        downvote,
        totalComment,
        upvote,
        constantActor,
        isAnonym,
        isOwnPost,
        message,
        actor
      } = getDetail(req, b, mySignedId);
      const mapCountLevel2 = countLevel2(childComment);
      const totalCommentLevel3 = countCommentLv3(childComment, [0]);
      const total3 = totalCommentLevel3.reduce((a, b) => a + b);

      const commentLevel2 = mapCountLevel2.reduce((a, b) => a + b);
      if (!newGroup[activity_id]) {
        pushToa(a, b, newGroup, actor, {
          activity_id,
          data: {
            last_message_at: localDate,
            updated_at: localDate
          },
          expired_at,
          isSeen: b.isSeen,
          totalComment: totalComment + commentLevel2 + total3,
          isOwnPost,
          totalCommentBadge: 0,
          isRead: b.isRead,
          type: 'post-notif',
          titlePost: message,
          downvote,
          upvote,
          postMaker: actor,
          isAnonym,
          comments: []
        });
      }
      const myReaction = b.reaction;
      finalize(req, mySignedId, myReaction, newGroup, activity_id, constantActor);
      return a;
    }, []);
    const feedGroup = await getFeedGroup(groupingFeed)
    res.status(200).send({
      success: true,
      data: feedGroup,
      message: 'Success get data'
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      data: null,
      message: String(e)
    });
  }
};

module.exports = getAnonymousFeedChatService;
