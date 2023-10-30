const Validator = require('fastest-validator');
const {User, sequelize} = require('../../databases/models');
const {checkMoreOrLess} = require('../../helpers/checkMoreOrLess');

const validator = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      username: 'string|empty:false'
    };

    const validated = validator.validate(req.params, schema);
    if (!validated)
      return res.json({
        code: 403,
        message: validated,
        status: 'error'
      });

    const {username} = req.params;

    const user = await User.findOne({
      where: {username: req.params.username},
      attributes: {
        exclude: ['human_id', 'is_backdoor_user', 'encrypted']
      }
    });

    if (!user)
      return res.json({
        code: 404,
        message: `No user with username ${username} found`,
        status: 'error'
      });

    const targetUserId = user?.dataValues?.user_id;

    const getFollowerCountQuery = `SELECT COUNT(user_follow_user.user_id_follower) as count_follower from user_follow_user WHERE user_id_followed = :user_id`;
    const getFollowingCountQuery = `SELECT COUNT(user_follow_user.user_id_followed) as count_following from user_follow_user WHERE user_id_follower = :user_id`;
    const isFollowingQuery = `SELECT * FROM user_follow_user WHERE user_id_followed= :user_id_followed AND user_id_follower= :user_id_follower`;

    const getFollowerCount = await sequelize.query(getFollowerCountQuery, {
      replacements: {user_id: targetUserId}
    });

    const getFollowingCount = await sequelize.query(getFollowingCountQuery, {
      replacements: {user_id: targetUserId}
    });

    const isFollowing = await sequelize.query(isFollowingQuery, {
      replacements: {user_id_followed: targetUserId, user_id_follower: req.userId}
    });

    const getFollowerCountResult = getFollowerCount?.[0]?.[0]?.count_follower;
    console.log('getFollowerCountResult');
    console.log(getFollowerCountResult);
    const getFollowingCountResult = getFollowingCount?.[0]?.[0]?.count_following;
    const isFollowingResult = isFollowing?.[0]?.length > 0;

    const clonedUser = {...user.dataValues};
    delete clonedUser.following;
    delete clonedUser.follower;

    clonedUser.following_symbol = checkMoreOrLess(getFollowingCountResult);
    clonedUser.follower_symbol = checkMoreOrLess(getFollowerCountResult);

    clonedUser.isSignedMessageEnabled = false;
    clonedUser.isAnonMessageEnabled = false;

    clonedUser.is_following = isFollowingResult;
    if (clonedUser.only_received_dm_from_user_following)
      clonedUser.isSignedMessageEnabled = isFollowingResult;
    else clonedUser.isSignedMessageEnabled = true;

    clonedUser.isAnonMessageEnabled = clonedUser.allow_anon_dm && clonedUser.isSignedMessageEnabled;

    return res.json({
      code: 200,
      message: 'Success',
      data: clonedUser
    });
  } catch (e) {
    console.log(e);
    return res.json({
      code: 500,
      message: e,
      status: 'error'
    });
  }
};
