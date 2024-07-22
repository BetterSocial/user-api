const reactionList = require('../../vendor/getstream/feed/reactionList');
const moment = require('moment');
const Getstream = require('../../vendor/getstream');
const {getAnonymUser} = require('../../utils/getAnonymUser');
const {handleAnonymousData} = require('../../utils');
const {getListBlockUser} = require('../../services/blockUser');
const {User} = require('../../databases/models');
const UsersFunction = require('../../databases/functions/users');

const INITIAL_COMMENT_LEVEL = 1;
const MAX_COMMENT_LEVEL = 3;

module.exports = async (req, res) => {
  try {
    const {params, query} = req;
    const post = await Getstream.feed.getPlainFeedById(params.id);
    const myAnonymousId = await getAnonymUser(req.userId);
    const blockedUserList = await getListBlockUser(req.userId);
    // Convert string to array if necessary
    let blockedUserArray;
    if (typeof blockedUserList === 'string') {
      try {
        blockedUserArray = JSON.parse(blockedUserList);
      } catch (error) {
        console.error('Error parsing blockedUserList:', error);
        blockedUserArray = [];
      }
    } else {
      blockedUserArray = blockedUserList;
    }
    const blockedUsers = blockedUserArray.map((user) => user.user_id_blocked);
    const reaction = await reactionList(params.id, query.kind, query.limit);
    let level1Comments = buildComment(INITIAL_COMMENT_LEVEL, reaction.results);

    // get comment users

    let actors = [];
    const collectUserIds = (comment) => {
      if (comment?.user?.id && !actors.includes(comment.user.id)) {
        actors.push(comment.user.id);
      }
      comment?.latest_children?.comment?.forEach(collectUserIds);
    };
    level1Comments.forEach(collectUserIds);
    // Filter out comments from blocked users
    level1Comments = level1Comments.filter((comment) => !blockedUsers.includes(comment.user.id));

    const karmaScores = await UsersFunction.getUsersKarmaScore(User, actors);

    const removeSensitiveData = await Promise.all(
      level1Comments.map(async (data) => {
        return handleAnonymousData(
          data,
          req,
          post.actor.id,
          myAnonymousId,
          data.user_id,
          karmaScores
        );
      })
    );
    let removeDeletedUser = removeSensitiveData.filter((data) => data.user);
    res.status(200).send({
      success: true,
      data: removeDeletedUser,
      message: 'success get reaction data',
      total: removeSensitiveData.length
    });
  } catch (e) {
    res.status(400).send({
      success: false,
      data: [],
      message: 'failed to get reaction list',
      error: e
    });
  }
};

function sortCommentsCreatedAtAscending(comments) {
  return [...comments].sort(
    (prev, next) => moment(prev.created_at).unix() - moment(next.created_at).unix()
  );
}

function buildComment(level, comments) {
  if (!Array.isArray(comments)) return [];

  const built = comments?.map((comment) => {
    const nextLevelComments = buildComment(level + 1, comment?.latest_children?.comment);

    if (level === MAX_COMMENT_LEVEL)
      return {
        ...comment
      };

    return {
      ...comment,
      latest_children: {
        comment: sortCommentsCreatedAtAscending(nextLevelComments)
      }
    };
  });

  return sortCommentsCreatedAtAscending(built);
}
