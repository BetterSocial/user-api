const moment = require('moment');
const {Sequelize} = require('sequelize');
const UsersFunction = require('../../databases/functions/users');
const {User, sequelize} = require('../../databases/models');
const getstreamService = require('../../services/getstream');
const roundingKarmaScore = require('../../helpers/roundingKarmaScore');

const mappingFeed = (req, feeds) => {
  const mapping = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const activity of feeds.activities) {
    const objectExpiredAt = moment(activity?.object?.expired_at).add('48', 'hours');
    const activityExpiredAt = moment(activity?.expired_at).add('48', 'hours');
    const showToastObjectExpiredAt = moment(activity?.object?.expired_at);
    const showToastActivityExpiredAt = moment(activity?.expired_at);
    const showToast =
      showToastObjectExpiredAt.isBefore(moment().utc()) ||
      showToastActivityExpiredAt.isBefore(moment().utc());

    const expiredAtNotNull = activity?.object?.expired_at || activity?.expired_at;

    try {
      if (objectExpiredAt.isBefore(moment().utc()) || activityExpiredAt.isBefore(moment().utc())) {
        // eslint-disable-next-line no-continue
        continue;
      }

      mapping.push({
        ...activity,
        showToast: expiredAtNotNull ? showToast : false,
        isSeen: feeds.is_seen,
        isRead: feeds.is_read
      });
    } catch (e) {
      console.log(e);
    }
  }

  return mapping;
};

const getDetail = (req, b, id, anonymousId) => {
  const activity_id = b.reaction?.activity_id || b.id;
  const expired_at = b?.object?.expired_at || b.expired_at || null;
  const downvote = typeof b.object === 'object' ? b.object.reaction_counts?.downvotes : 0;
  const upvote = typeof b.object === 'object' ? b.object.reaction_counts?.upvotes : 0;
  const totalComment = typeof b.object === 'object' ? b.object.reaction_counts?.comment : 0;
  const childComment = typeof b.object === 'object' ? b.object?.latest_reactions?.comment : [0];
  const message = typeof b.object === 'object' ? b.object.message : b.message;
  const constantActor = typeof b.object === 'object' ? b.object.actor : b.actor;
  let actor = typeof b.object === 'object' ? b.object.actor : b.actor;
  const isAnonym = typeof b.object === 'object' ? b.object.anonimity : b.anonimity;
  const isOwnSignedPost = actor?.id === id;
  const isOwnAnonymousPost = actor?.id === anonymousId;
  const isOwnPost = isOwnAnonymousPost || isOwnSignedPost;
  if (isAnonym) {
    actor = {
      ...actor,
      id: null,
      data: {
        username: `Anonymous ${
          b.object?.anon_user_info_emoji_name ?? b?.anon_user_info_emoji_name
        }`,
        emoji_name: b.object?.anon_user_info_emoji_name ?? b?.anon_user_info_emoji_name,
        emoji_code: b.object?.anon_user_info_emoji_code ?? b?.anon_user_info_emoji_code,
        color_name: b.object?.anon_user_info_color_name ?? b?.anon_user_info_color_name,
        color_code: b.object?.anon_user_info_color_code ?? b?.anon_user_info_color_code
      }
    };
  }
  return {
    activity_id,
    expired_at,
    downvote,
    upvote,
    totalComment,
    childComment,
    message,
    constantActor,
    isAnonym,
    isOwnSignedPost,
    isOwnPost,
    isOwnAnonymousPost,
    actor,
    showToast: b.showToast
  };
};

const countLevel2 = (childComment = []) =>
  childComment?.map((comment) => comment?.children_counts?.comment || 0);

const countCommentLv3 = (childComment = [], totalCommentLevel3 = []) => {
  Promise.all(
    childComment?.map((comment) => {
      const mapCount = comment?.latest_children?.comment?.map(
        (comment2) => comment2?.children_counts?.comment || 0
      );
      if (Array.isArray(mapCount)) {
        totalCommentLevel3.push(...mapCount);
      }
      return comment;
    })
  )
    .then(() => totalCommentLevel3)
    .catch(() => totalCommentLevel3);
  return totalCommentLevel3;
};

const pushToa = (a, b, newGroup, actor, data) => {
  newGroup[data.activity_id] = {
    ...data,
    unreadComment: !data.isRead ? 1 : 0,
    downvote: data.downvote || 0,
    upvote: data.upvote || 0
  };
  if (actor && typeof actor === 'object') {
    a.push(newGroup[data.activity_id]);
  }
};

const finalize = (req, id, myReaction, newGroup, activity_id, constantActor, karmaScores = []) => {
  if (myReaction) {
    myReaction = {
      ...myReaction,
      isOwningReaction: req.userId === myReaction.user_id
    };
    if (myReaction.data.is_anonymous || myReaction.data.anon_user_info_emoji_name) {
      myReaction = {...myReaction, user_id: null, user: {}};
    }

    if (myReaction.kind === 'comment') {
      const user = karmaScores.find((user) => user.user_id === myReaction.user_id);
      myReaction.user.karmaScores = roundingKarmaScore(user?.karma_score || 0);
      newGroup[activity_id].comments.push({
        reaction: myReaction,
        actor:
          myReaction.data.is_anonymous || myReaction.data.anon_user_info_emoji_name
            ? {}
            : constantActor
      });
    }

    newGroup[activity_id].totalCommentBadge =
      newGroup[activity_id].comments.filter(
        (data) => constantActor?.id !== req.userId && data.reaction.kind === 'comment'
      )?.length || 0;
    const listComment = newGroup[activity_id]?.comments?.filter(
      (data) => data.reaction.kind === 'comment'
    );
    if (listComment.length > 0) {
      const sortedCommentByCreatedAt = listComment.sort(
        (a, b) => new Date(b.reaction.created_at) - new Date(a.reaction.created_at)
      );

      const sortedCommentByUpdatedAt = listComment.sort(
        (a, b) => new Date(b.reaction.updated_at) - new Date(a.reaction.updated_at)
      );

      newGroup[activity_id].data.last_message_at =
        sortedCommentByCreatedAt?.[0]?.reaction?.created_at;

      newGroup[activity_id].data.updated_at = sortedCommentByUpdatedAt?.[0]?.reaction?.created_at;
    }
  }
};

const getFeedGroup = async (groupingFeed) => {
  const feedGroup = [];
  const feedIds = [];
  for (const feed of groupingFeed) {
    feedIds.push(feed.activity_id);
  }

  let resultBlockCount = [];
  try {
    const queryBlockCount = `
    SELECT post_id, COUNT(post_id) AS COUNT
    FROM user_blocked_user
    WHERE post_id IN (:feedIds)
    GROUP BY post_id`;

    resultBlockCount = await sequelize.query(queryBlockCount, {
      replacements: {
        feedIds
      },
      type: Sequelize.QueryTypes.SELECT
    });
  } catch (e) {
    console.error('Failed to get count block users', e);
    throw e;
  }

  for (const feed2 of groupingFeed) {
    const filteredFeed = resultBlockCount.filter(
      (feedDetail) => feed2.activity_id === feedDetail.post_id
    );
    const blockCount = filteredFeed[0] ? parseInt(filteredFeed[0].count) : 0;

    feedGroup.push({...feed2, block: blockCount});
  }

  feedGroup.sort(
    (a, b) => moment(b.data.last_message_at).valueOf() - moment(a.data.last_message_at).valueOf()
  );
  return feedGroup;
};

const getFeedChatService = async (req, res) => {
  try {
    const myAnonymousId = await UsersFunction.findAnonymousUserId(User, req.userId);

    const data = await getstreamService.notificationGetNewFeed(req.userId, req.token);
    const newFeed = [];

    let {last_fetch_date = null} = req.query;
    if (last_fetch_date) {
      last_fetch_date = moment.utc(last_fetch_date).format('YYYY-MM-DDTHH:mm:ss');
    }
    for (const feeds of data.results) {
      if (last_fetch_date && feeds.updated_at < last_fetch_date) {
        continue;
      }
      const mapping = mappingFeed(req, feeds);
      newFeed.push(...mapping);
    }

    if (newFeed.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: 'Success get data'
      });
    }

    let actors = [];
    for (const feed of newFeed) {
      if (!actors.includes(feed.actor.id)) {
        actors.push(feed.actor.id);
      }
      if (feed.reaction && !actors.includes(feed.reaction.user_id)) {
        actors.push(feed.reaction.user_id);
      }
    }
    const karmaScores = await UsersFunction.getUsersKarmaScore(User, actors);

    const newGroup = {};
    const groupingFeed = newFeed.reduce((a, b) => {
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
        isOwnSignedPost,
        isOwnAnonymousPost,
        message,
        actor,
        showToast = false
      } = getDetail(req, b, req?.userId, myAnonymousId?.user_id);

      const user = karmaScores.find((user) => user.user_id === actor.id);
      actor.karmaScores = roundingKarmaScore(user?.karma_score || 0);

      const mapCountLevel2 = countLevel2(childComment);

      const totalCommentLevel3 = countCommentLv3(childComment, [0]);

      const total3 = totalCommentLevel3?.reduce((acc, curr) => acc + curr, 0);

      const commentLevel2 = mapCountLevel2.reduce((acc, curr) => acc + curr, 0);

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
          isOwnAnonymousPost,
          isOwnSignedPost,
          totalCommentBadge: 0,
          isRead: b.isRead,
          type: 'post-notif',
          titlePost: message,
          downvote,
          upvote,
          postMaker: actor,
          isAnonym,
          comments: [],
          showToast
        });
      }
      const myReaction = b.reaction;
      finalize(
        req,
        myAnonymousId.user_id,
        myReaction,
        newGroup,
        activity_id,
        constantActor,
        karmaScores
      );
      return a;
    }, []);
    const feedGroup = await getFeedGroup(groupingFeed);
    res.status(200).send({
      success: true,
      data: feedGroup,
      message: 'Success get data'
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      success: false,
      data: null,
      message: String(e)
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
  getFeedGroup
};
