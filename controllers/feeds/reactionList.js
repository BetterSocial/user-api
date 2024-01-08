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
    let sortByDate = reaction.results.sort(
      (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix()
    );
    sortByDate = sortByDate.map((commentRes) => {
      const sortComment = commentRes?.latest_children?.comment?.sort(
        (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix()
      );
      return {...commentRes, latest_children: {comment: sortComment}};
    });

    // get comment users
    let actors = [];
    sortByDate.map((comment_lvl1) => {
      if (!actors.includes(comment_lvl1?.user?.id)) {
        actors.push(comment_lvl1?.user?.id);
      }
      comment_lvl1?.latest_children?.comment?.map((comment_lvl2) => {
        if (!actors.includes(comment_lvl2?.user?.id)) {
          actors.push(comment_lvl2?.user?.id);
        }
      });
    });
    const karmaScores = await UsersFunction.getUsersKarmaScore(User, actors);

    const removeSensitiveData = await Promise.all(
      sortByDate.map(async (data) => {
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
