const {User, sequelize} = require('../../databases/models');
const {checkMoreOrLess} = require('../../helpers/checkMoreOrLess');

module.exports = async (req, res) => {
  try {
    // check this route is use auth or not
    let excludeField = [
      'human_id',
      'is_backdoor_user',
      'encrypted',
      'created_at',
      'updated_at',
      'real_name',
      'last_active_at',
      'status',
      'is_banned'
    ];
    if (req?.userId) {
      excludeField = ['human_id', 'is_backdoor_user', 'encrypted'];
    }

    const user = await User.findOne({
      where: {username: req.params.username},
      attributes: {
        exclude: excludeField
      }
    });

    if (user === null) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'User not found'
      });
    }

    const targetUserId = user?.dataValues?.user_id;

    const getFollowerCountQuery = `SELECT COUNT(user_follow_user.user_id_follower) as count_follower from user_follow_user WHERE user_id_followed = :user_id`;
    const getFollowingCountQuery = `SELECT COUNT(A.user_id_followed) as count_following 
                                    from user_follow_user A
                                    INNER JOIN users B ON A.user_id_followed = B.user_id
                                    WHERE A.user_id_follower = :user_id
                                    AND B.is_anonymous = false`;
    const isFollowingQuery = `SELECT * FROM user_follow_user WHERE user_id_followed= :user_id_followed AND user_id_follower= :user_id_follower`;

    const getFollowerCount = await sequelize.query(getFollowerCountQuery, {
      replacements: {user_id: targetUserId}
    });

    const getFollowingCount = await sequelize.query(getFollowingCountQuery, {
      replacements: {user_id: targetUserId}
    });

    const isFollowing = await sequelize.query(isFollowingQuery, {
      replacements: {user_id_follower: req?.userId || '', user_id_followed: targetUserId}
    });

    const getFollowerCountResult = getFollowerCount?.[0]?.[0]?.count_follower;
    const getFollowingCountResult = getFollowingCount?.[0]?.[0]?.count_following;
    const isFollowingResult = isFollowing?.[0]?.length > 0;

    const copyUser = {...user.dataValues};

    delete copyUser.following;
    delete copyUser.follower;

    copyUser.following_symbol = checkMoreOrLess(getFollowingCountResult);
    copyUser.follower_symbol = checkMoreOrLess(getFollowerCountResult);

    if (req?.userId) {
      copyUser.is_following = isFollowingResult;
      if (copyUser.only_received_dm_from_user_following)
        copyUser.isSignedMessageEnabled = isFollowingResult;
      else copyUser.isSignedMessageEnabled = true;
    }

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
