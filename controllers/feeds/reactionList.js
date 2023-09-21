const reactionList = require('../../vendor/getstream/feed/reactionList');
const moment = require('moment');
const Getstream = require('../../vendor/getstream');
const {getAnonymUser} = require('../../utils/getAnonymUser');
const {handleAnonymousData} = require('../../utils');

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

    const removeSensitiveData = await Promise.all(
      sortByDate.map(async (data) => {
        return handleAnonymousData(data, req, post.actor.id, myAnonymousId, data.user_id);
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
