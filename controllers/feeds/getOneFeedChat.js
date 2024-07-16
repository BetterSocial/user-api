const moment = require('moment');
const {UserBlockedUser, User} = require('../../databases/models');
const getstreamService = require('../../services/getstream');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const UsersFunction = require('../../databases/functions/users');
const roundingKarmaScore = require('../../helpers/roundingKarmaScore');
const {getMessage} = require('./getFeedChat');

const constructData = ({selfUserId, data, datum, constantActor, shouldIncludeActorData = true}) => {
  datum.isOwningReaction = selfUserId === datum.user_id;
  if (datum.data.is_anonymous || datum.data.anon_user_info_emoji_name) {
    datum.user_id = null;
    datum.user = {};
  }

  if (!shouldIncludeActorData) {
    datum.user = {};
  }

  const getActorData = () => {
    if (datum?.user_id && shouldIncludeActorData) {
      return constantActor;
    }

    return {};
  };

  data.push({
    reaction: {
      ...datum
    },
    actor: getActorData()
  });
};

const getReaction = (req, latest_reactions, constantActor) => {
  const comments = [];
  const upvotes = [];
  const downvotes = [];
  if (Array.isArray(latest_reactions.comment)) {
    latest_reactions.comment.map((comment) =>
      constructData({selfUserId: req?.userId, data: comments, datum: comment, constantActor})
    );
  }
  if (Array.isArray(latest_reactions.upvotes)) {
    latest_reactions.upvotes.map((upvote) =>
      constructData({
        selfUserId: req?.userId,
        data: upvotes,
        datum: upvote,
        constantActor,
        shouldIncludeActorData: false
      })
    );
  }
  if (Array.isArray(latest_reactions.downvotes)) {
    latest_reactions.downvotes.map((downvote) =>
      constructData({
        selfUserId: req?.userId,
        data: downvotes,
        datum: downvote,
        constantActor,
        shouldIncludeActorData: false
      })
    );
  }
  return {comments, upvotes, downvotes};
};

const getOneFeedChatService = async (req, res) => {
  let selfSignedUserId = null;
  let selfAnonymousUserId = null;

  if (req?.user?.is_anonymous) {
    selfSignedUserId = await UsersFunction.findSignedUserId(User, req.userId);
    selfAnonymousUserId = req.userId;
  } else {
    const user = await UsersFunction.findAnonymousUserId(User, req.userId);
    selfAnonymousUserId = user?.id;
    selfSignedUserId = req.userId;
  }
  try {
    const data = await getstreamService.getFeeds(req.token, 'notification', {
      ids: [req.params.feedId],
      withRecentReactions: true,
      withReactionCounts: true,
      withOwnReactions: true,
      mark_read: false,
      mark_seen: false
    });

    if (data.results.length < 1) {
      return ErrorResponse.e404(res, 'Feed not found');
    }
    if (moment(data.results[0].expired_at).isBefore(moment().utc())) {
      return ErrorResponse.e400(res, 'Feed alredy expired');
    }
    let {comments, upvotes, downvotes} = getReaction(
      req,
      data.results[0].latest_reactions,
      data.results[0].actor
    );
    let updated_at;
    let last_message_at = moment.utc(data.results[0].time).local().format();
    updated_at = last_message_at;
    if (comments.length > 0) {
      last_message_at = comments[0].reaction.created_at;
      updated_at = last_message_at;
    }

    const isAnonym = data.results[0].object?.anonimity ?? data.results[0].anonimity;
    const actor = data?.results?.[0]?.actor;

    let karmaActors = [];
    if (!karmaActors.includes(actor.id)) {
      karmaActors.push(actor.id);
    }
    for (const comment of comments) {
      if (!karmaActors.includes(comment?.reaction?.user_id)) {
        karmaActors.push(comment?.reaction?.user_id);
      }
    }

    const karmaScores = await UsersFunction.getUsersKarmaScore(User, karmaActors);
    comments = comments.map((comment) => {
      const user = karmaScores.find((user) => user.user_id === comment.reaction.user_id);
      if (user && comment.reaction.user) {
        comment.reaction.user.karmaScores = roundingKarmaScore(user?.karma_score || 0);
      }
      if (comment.reaction.latest_children.comment) {
        comment.reaction.latest_children.comment = comment.reaction?.latest_children?.comment?.map(
          (child) => {
            const user = karmaScores.find((user) => user.user_id === child.user_id);
            if (user && child.user) {
              child.user.karmaScores = roundingKarmaScore(user?.karma_score || 0);
              return child;
            }
          }
        );
      }
      return comment;
    });

    const user = karmaScores.find((user) => user.user_id === actor.id);
    actor.karmaScores = roundingKarmaScore(user?.karma_score || 0);

    if (data?.results[0]?.anonimity) {
      actor.data.username = `${data?.results?.[0]?.anon_user_info_color_name} ${data?.results[0]?.anon_user_info_emoji_name}`;
      actor.data.anon_user_info_emoji_name = data?.results[0]?.anon_user_info_emoji_name;
      actor.data.anon_user_info_emoji_code = data?.results[0]?.anon_user_info_emoji_code;
      actor.data.anon_user_info_color_name = data?.results[0]?.anon_user_info_color_name;
      actor.data.anon_user_info_color_code = data?.results[0]?.anon_user_info_color_code;
    }

    const postMakerUserId = data?.results[0]?.actor?.id;

    if (isAnonym && actor) {
      actor.id = null;
    }

    const titlePost = getMessage(data.results[0]);

    const response = {
      activity_id: data.results[0].id,
      data: {
        last_message_at,
        updated_at
      },
      expired_at: data.results[0].expired_at,
      totalComment: data.results[0].reaction_counts?.comment ?? 0,
      isOwnPost: req.userId === postMakerUserId,
      isOwnSignedPost: selfSignedUserId === postMakerUserId,
      isOwnAnonymousPost: selfAnonymousUserId === postMakerUserId,
      totalCommentBadge: comments.filter((comment) => comment.actor.id !== req.userId).length ?? 0,
      type: 'post-notif',
      titlePost,
      downvote: data.results[0].reaction_counts?.downvotes ?? 0,
      upvote: data.results[0].reaction_counts?.upvotes ?? 0,
      postMaker: actor,
      isAnonym,
      comments,
      upvotes,
      downvotes
    };

    const blockCount = await UserBlockedUser.count({
      where: {
        post_id: response.activity_id
      }
    });
    response.block = blockCount;

    return res.status(200).send({
      success: true,
      data: response,
      message: 'Success get data'
    });
  } catch (e) {
    console.error(e);
    return res.status(400).json({
      success: false,
      data: null,
      message: String(e)
    });
  }
};

module.exports = getOneFeedChatService;
