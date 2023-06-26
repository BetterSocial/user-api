const UsersFunction = require('../../databases/functions/users');
const { UserBlockedUser, User } = require('../../databases/models');
const getstreamService = require('../../services/getstream');
const moment = require('moment');

const mappingFeed = (req, feeds) => {
  const mapping = [];
  for (const activity of feeds.activities) {
    if (
      moment(activity.object.expired_at).isBefore(moment().utc()) ||
      moment(activity.expired_at).isBefore(moment().utc())
    ) {
      continue;
    }

    mapping.push({
      ...activity,
      isSeen: feeds.is_seen,
      isRead: feeds.is_read,
    });
  }

  return mapping;
};

const getDetail = (req, b, id) => {
  const activity_id = b.reaction?.activity_id || b.id;
  const downvote =
    typeof b.object === 'object' ? b.object.reaction_counts.downvotes : 0;
  const upvote =
    typeof b.object === 'object' ? b.object.reaction_counts.upvotes : 0;
  const totalComment =
    typeof b.object === 'object' ? b.object.reaction_counts.comment : 0;
  const childComment =
    typeof b.object === 'object' ? b.object?.latest_reactions?.comment : [0];
  const message = typeof b.object === 'object' ? b.object.message : b.message;
  const constantActor = typeof b.object === 'object' ? b.object.actor : b.actor;
  let actor = typeof b.object === 'object' ? b.object.actor : b.actor;
  const isAnonym =
    typeof b.object === 'object' ? b.object.anonimity : b.anonimity;
  const isOwnPost = actor.id === req.userId || actor.id === id;
  if (isAnonym) {
    actor = {
      ...actor,
      id: null,
      data: {
        username: 'Anonymous',
      },
    };
  }
  return {
    activity_id,
    downvote,
    upvote,
    totalComment,
    childComment,
    message,
    constantActor,
    isAnonym,
    isOwnPost,
    actor,
  };
};

const countLevel2 = (childComment) => {
  return childComment.map((comment) => comment?.children_counts?.comment || 0);
};

const countCommentLv3 = (childComment, totalCommentLevel3 = []) => {
  Promise.all(
    childComment.map((comment) => {
      const mapCount = comment?.latest_children?.comment?.map(
        (comment) => comment?.children_counts?.comment || 0
      );
      if (Array.isArray(mapCount)) {
        totalCommentLevel3.push(...mapCount);
      }
    })
  ).then(() => {
    return totalCommentLevel3;
  });
  return totalCommentLevel3;
};

const pushToa = (a, b, newGroup, actor, data) => {
  newGroup[data.activity_id] = {
    ...data,
    unreadComment: !data.isRead ? 1 : 0,
    downvote: data.downvote || 0,
    upvote: data.upvote || 0,
  };
  if (actor && typeof actor === 'object') {
    a.push(newGroup[data.activity_id]);
  }
};

const finalize = (
  req,
  id,
  myReaction,
  newGroup,
  activity_id,
  constantActor
) => {
  if (myReaction) {
    myReaction = {
      ...myReaction,
      isOwningReaction:
        req.userId === myReaction.user_id || myReaction.user_id === id,
    };
    if (
      myReaction.data.is_anonymous ||
      myReaction.data.anon_user_info_emoji_name
    ) {
      myReaction = { ...myReaction, user_id: null, user: {} };
    }
    newGroup[activity_id].comments.push({
      reaction: myReaction,
      actor:
        myReaction.data.is_anonymous ||
        myReaction.data.anon_user_info_emoji_name
          ? {}
          : constantActor,
    });
    // newGroup[activity_id].totalComment = newGroup[activity_id].comments.filter((data) => data.reaction.kind === 'comment').length || 0
    newGroup[activity_id].totalCommentBadge =
      newGroup[activity_id].comments.filter(
        (data) =>
          constantActor.id !== req.userId && data.reaction.kind === 'comment'
      )?.length || 0;
    if (newGroup[activity_id]?.comments?.length > 0) {
      newGroup[activity_id].data.last_message_at = newGroup[
        activity_id
      ].comments.filter(
        (data) => data.reaction.kind === 'comment'
      )?.[0]?.reaction?.created_at;
      newGroup[activity_id].data.updated_at = newGroup[
        activity_id
      ].comments.filter(
        (data) => data.reaction.kind === 'comment'
      )?.[0]?.reaction?.created_at;
    }
  }
};

const getFeedChatService = async (req, res) => {
  try {
    const myAnonymousId = await UsersFunction.findAnonymousUserId(
      User,
      req.userId
    );

    const data = await getstreamService.notificationGetNewFeed(
      req.userId,
      req.token
    );
    let newFeed = [];

    for (const feeds of data.results) {
      const mapping = mappingFeed(req, feeds);
      newFeed.push(...mapping);
    }

    let newGroup = {};
    const groupingFeed = newFeed.reduce((a, b, index) => {
      const localDate = moment.utc(b.time).local().format();
      const {
        activity_id,
        childComment,
        downvote,
        totalComment,
        upvote,
        constantActor,
        isAnonym,
        isOwnPost,
        message,
        actor,
      } = getDetail(req, b, myAnonymousId.user_id);
      const mapCountLevel2 = countLevel2(childComment);
      const totalCommentLevel3 = countCommentLv3(childComment, [0]);

      const total3 = totalCommentLevel3.reduce((a, b) => a + b);

      const commentLevel2 = mapCountLevel2.reduce((a, b) => a + b);

      if (!newGroup[activity_id]) {
        pushToa(a, b, newGroup, actor, {
          activity_id: activity_id,
          data: {
            last_message_at: localDate,
            updated_at: localDate,
          },
          isSeen: b.isSeen,
          totalComment: totalComment + commentLevel2 + total3,
          isOwnPost,
          totalCommentBadge: 0,
          isRead: b.isRead,
          type: 'post-notif',
          titlePost: message,
          downvote: downvote,
          upvote: upvote,
          postMaker: actor,
          isAnonym: isAnonym,
          comments: [],
        });
      }
      let myReaction = b.reaction;
      finalize(
        req,
        myAnonymousId.user_id,
        myReaction,
        newGroup,
        activity_id,
        constantActor
      );
      return a;
    }, []);
    let feedGroup = [];
    for (const feed of groupingFeed) {
      const blockCount = await UserBlockedUser.count({
        where: {
          post_id: feed.activity_id,
        },
      });
      feedGroup.push({ ...feed, block: blockCount });
    }
    feedGroup.sort(
      (a, b) =>
        moment(b.data.last_message_at).valueOf() -
        moment(a.data.last_message_at).valueOf()
    );
    res.status(200).send({
      success: true,
      data: feedGroup,
      message: 'Success get data',
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      data: null,
      message: String(e),
    });
  }
};

module.exports = {
  getFeedChatService,
  mappingFeed,
  getDetail,
  countLevel2,
  countCommentLv3,
  pushToa,
  finalize,
};
