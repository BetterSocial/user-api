const getstreamService = require('../../services/getstream');
const {MAX_FEED_FETCH_LIMIT} = require('../../helpers/constants');
const {User} = require('../../databases/models');

const _ = require('lodash');
const {filterFeeds} = require('../../utils/post');
const UsersFunction = require('../../databases/functions/users');

module.exports = async (req, res) => {
  let {limit = MAX_FEED_FETCH_LIMIT, offset = 0} = req.query;

  const token = req.token;
  const myAnonymousUser = await UsersFunction.findAnonymousUserId(User, req.userId);

  getstreamService
    .getFeeds(token, 'user_excl', {
      reactions: {own: true, recent: true, counts: true},
      limit,
      offset
      // ranking: GETSTREAM_TIME_LINEAR_RANKING_METHOD,
    })

    .then(async (result) => {
      let data = await filterFeeds(req?.userId, myAnonymousUser?.user_id, result?.results || []);

      res.status(200).json({
        code: 200,
        status: 'success',
        data: data
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(403).json({
        status: 'failed',
        data: null,
        error: err
      });
    });
};
