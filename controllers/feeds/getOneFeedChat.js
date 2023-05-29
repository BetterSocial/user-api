const UsersFunction = require('../../databases/functions/users');
const { UserBlockedUser, User } = require('../../databases/models');
const getstreamService = require('../../services/getstream');
const moment = require('moment');
const ErrorResponse = require('../../utils/response/ErrorResponse');

const constructData = (req, data, datum, constantActor) => {
  datum.isOwningReaction = req.userId === datum.user_id;
  if (datum.data.is_anonymous || datum.data.anon_user_info_emoji_name) {
    datum.user_id = null;
    datum.user = {};
  }
  data.push({
    reaction: {
      ...datum,
    },
    actor: datum.user_id ? constantActor : {},
  });
};

const getReaction = (req, latest_reactions, constantActor) => {
  const comments = [];
  const upvotes = [];
  const downvotes = [];
  if (Array.isArray(latest_reactions.comment)) {
    latest_reactions.comment.map((comment) => {
      constructData(req, comments, comment, constantActor);
    });
  }
  if (Array.isArray(latest_reactions.upvotes)) {
    latest_reactions.upvotes.map((upvote) => {
      constructData(req, upvotes, upvote, constantActor);
    });
  }
  if (Array.isArray(latest_reactions.downvotes)) {
    latest_reactions.downvotes.map((downvote) => {
      constructData(req, downvotes, downvote, constantActor);
    });
  }
  return { comments, upvotes, downvotes };
};

const getOneFeedChatService = async (req, res) => {
  try {
    const data = await getstreamService.getFeeds(req.token, 'notification', {
      ids: [req.params.feedId],
      withRecentReactions: true,
      withReactionCounts: true,
      withOwnReactions: true,
      mark_read: false,
      mark_seen: false,
    });

    if (data.results.length < 1) {
      return ErrorResponse.e404(res, 'Feed not found');
    }

    const { comments, upvotes, downvotes } = getReaction(
      req,
      data.results[0].latest_reactions,
      data.results[0].actor
    );
    let updated_at;
    let last_message_at = (updated_at = moment
      .utc(data.results[0].time)
      .local()
      .format());
    if (comments.length > 0) {
      last_message_at = updated_at = comments[0].reaction.created_at;
    }
    const response = {
      activity_id: data.results[0].id,
      data: {
        last_message_at,
        updated_at,
      },
      totalComment: data.results[0].reaction_counts?.comment ?? 0,
      isOwnPost: data.results[0].actor.id === req.userId,
      totalCommentBadge:
        comments.filter((comment) => comment.actor.id !== req.userId).length ??
        0,
      type: 'post-notif',
      titlePost: data.results[0].object?.message ?? data.results[0].message,
      downvote: data.results[0].reaction_counts?.downvotes ?? 0,
      upvote: data.results[0].reaction_counts?.upvotes ?? 0,
      postMaker: data.results[0].actor,
      isAnonym: data.results[0].object?.anonimity ?? data.results[0].anonimity,
      comments,
      upvotes,
      downvotes,
    };

    const blockCount = await UserBlockedUser.count({
      where: {
        post_id: response.activity_id,
      },
    });
    response.block = blockCount;

    res.status(200).send({
      success: true,
      data: response,
      message: 'Success get data',
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({
      success: false,
      data: null,
      message: String(e),
    });
  }
};
module.exports = getOneFeedChatService;
