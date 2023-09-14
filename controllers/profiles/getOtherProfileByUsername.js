const {User, sequelize} = require('../../databases/models');
const {checkMoreOrLess} = require('../../helpers/checkMoreOrLess');

module.exports = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {username: req.params.username},
      attributes: {
        exclude: ['human_id']
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
      replacements: {user_id: req.userId}
    });

    const getFollowingCount = await sequelize.query(getFollowingCountQuery, {
      replacements: {user_id: req.userId}
    });

    const isFollowing = await sequelize.query(isFollowingQuery, {
      replacements: {user_id_follower: req?.userId, user_id_followed: user?.dataValues?.user_id}
    });

    const getFollowerCountResult = getFollowerCount?.[0]?.[0]?.count_follower;
    const getFollowingCountResult = getFollowingCount?.[0]?.[0]?.count_following;
    const isFollowingResult = isFollowing?.[0]?.length > 0;

    const copyUser = {...user.dataValues};

    delete copyUser.following;
    delete copyUser.follower;

    copyUser.following_symbol = checkMoreOrLess(getFollowingCountResult);
    copyUser.follower_symbol = checkMoreOrLess(getFollowerCountResult);

    copyUser.is_following = isFollowingResult;
    if (copyUser.only_received_dm_from_user_following)
      copyUser.isSignedMessageEnabled = isFollowingResult;
    else copyUser.isSignedMessageEnabled = true;

    copyUser.isAnonMessageEnabled = copyUser.allow_anon_dm && copyUser.isSignedMessageEnabled;

    return res.status(200).json({
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
