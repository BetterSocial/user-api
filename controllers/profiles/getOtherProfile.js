const Validator = require('fastest-validator');
const url = require('url');
const {User, sequelize} = require('../../databases/models');
const {checkMoreOrLess} = require('../../helpers/checkMoreOrLess');

const v = new Validator();

module.exports = async (req, res) => {
  try {
    const url_parts = url.parse(req.url, true);
    const {query} = url_parts;
    const schema = {
      other_user_id: 'string|empty:false'
    };
    const validate = v.validate(query, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: 'error',
        message: validate
      });
    }
    const {other_user_id} = query;

    const user = await User.findByPk(other_user_id, {
      attributes: {
        exclude: ['human_id', 'is_backdoor_user', 'encrypted']
      }
    });
    if (user === null) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'User not found'
      });
    }

    const getFollowerCountQuery = `SELECT COUNT(user_follow_user.user_id_follower) as count_follower from user_follow_user WHERE user_id_followed = :user_id`;
    const getFollowingCountQuery = `SELECT COUNT(user_follow_user.user_id_followed) as count_following from user_follow_user WHERE user_id_follower = :user_id`;
    const isFollowingQuery = `SELECT * FROM user_follow_user WHERE user_id_followed= :user_id_followed AND user_id_follower= :user_id_follower`;

    const getFollowerCount = await sequelize.query(getFollowerCountQuery, {
      replacements: {user_id: other_user_id}
    });

    const getFollowingCount = await sequelize.query(getFollowingCountQuery, {
      replacements: {user_id: other_user_id}
    });

    const isFollowing = await sequelize.query(isFollowingQuery, {
      replacements: {user_id_followed: other_user_id, user_id_follower: req.userId}
    });

    const getFollowerCountResult = getFollowerCount?.[0]?.[0]?.count_follower;
    const getFollowingCountResult = getFollowingCount?.[0]?.[0]?.count_following;

    const copyUser = {...user.dataValues};
    delete copyUser.following;
    delete copyUser.follower;
    copyUser.isSignedMessageEnabled = false;
    copyUser.isAnonMessageEnabled = false;
    if (!copyUser.only_received_dm_from_user_following) {
      copyUser.isSignedMessageEnabled = true;
      copyUser.isAnonMessageEnabled = copyUser.allow_anon_dm;
    }

    copyUser.following_symbol = checkMoreOrLess(getFollowingCountResult);
    copyUser.follower_symbol = checkMoreOrLess(getFollowerCountResult);

    copyUser.is_following = isFollowing?.[0]?.length > 0;

    return res.json({
      status: 'success',
      code: 200,
      data: copyUser
    });
  } catch (error) {
    const {status, data} = error.response;
    return res.status(500).json({
      code: status,
      status: 'error',
      message: data
    });
  }
};
