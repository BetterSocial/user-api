const getstreamService = require('../../services/getstream');
const moment = require('moment');

const Validator = require('fastest-validator');
const {handleAnonymousData} = require('../../utils');
const {getAnonymUser} = require('../../utils/getAnonymUser');
const getPlainFeedById = require('../../vendor/getstream/feed/getPlainFeedById');
const v = new Validator();
const {User} = require('../../databases/models');
const UsersFunction = require('../../databases/functions/users');

module.exports = async (req, res) => {
  try {
    const schema = {
      activity_id: 'string|empty:false'
    };
    const validate = v.validate(req.body, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: 'error',
        message: validate
      });
    }
    let {activity_id, limit, feed_id} = req.body;
    const token = req.token;
    const detailFeed = await getPlainFeedById(feed_id);
    const myAnonymUser = await getAnonymUser(req.userId);
    getstreamService
      .getReaction(activity_id, token, limit)
      .then(async (result) => {
        let actors = [];
        result.results.map((data) => {
          if (data.user_id) {
            actors.push(data.user_id);
          }
        });
        const karmaScores = await UsersFunction.getUsersKarmaScore(User, actors);
        let mappingNewRes = await Promise.all(
          result.results.map(async (dataUser) => {
            return handleAnonymousData(
              dataUser,
              req,
              detailFeed.actor.id,
              myAnonymUser,
              dataUser.user_id,
              karmaScores
            );
          })
        );
        mappingNewRes = mappingNewRes.sort(
          (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix()
        );
        res.status(200).json({
          status: 'success',
          data: mappingNewRes
        });
      })
      .catch((err) => {
        res.status(403).json({
          status: 'failed',
          data: null,
          error: err
        });
      });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: null,
      message: 'Internal server error',
      error: error
    });
  }
};
