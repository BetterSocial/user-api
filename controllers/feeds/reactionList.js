const reactionList = require('../../vendor/getstream/feed/reactionList');
const moment = require('moment');
const Getstream = require('../../vendor/getstream');
const {getAnonymUser} = require('../../utils/getAnonymUser');
const {handleAnonymousData} = require('../../utils');
const {User} = require('../../databases/models');
const UsersFunction = require('../../databases/functions/users');

module.exports = async (req, res) => {
  try {
    const {params, query} = req;
    const post = await Getstream.feed.getPlainFeedById(params.id);
    const myAnonymousId = await getAnonymUser(req.userId);
    const reaction = await reactionList(params.id, query.kind, query.limit);

    let level1Comments = buildComment(1, reaction.results);

    // get comment users

    let actors = [];
    const collectUserIds = (comment) => {
      if (comment?.user?.id && !actors.includes(comment.user.id)) {
        actors.push(comment.user.id);
      }
      comment?.latest_children?.comment?.forEach(collectUserIds);
    };
    level1Comments.forEach(collectUserIds);

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
  return comments.sort(
    (prev, next) => moment(prev.created_at).unix() - moment(next.created_at).unix()
  );
}

function buildComment(level, comments) {
  if (level > 3 || !Array.isArray(comments)) return [];
  const built = comments?.map((comment) => {
    const nextLevelComments = buildComment(level + 1, comment?.latest_children?.comment);

    if (level === 3)
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

  return built;
}
