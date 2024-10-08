const UsersFunction = require('../../databases/functions/users');
const {User, ChatAnonUserInfo, sequelize} = require('../../databases/models');
const {checkMoreOrLess} = require('../../helpers/checkMoreOrLess');
const roundingKarmaScore = require('../../helpers/roundingKarmaScore');
const {StreamChat} = require('stream-chat');

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

    const getFollowerCountPromise = sequelize.query(getFollowerCountQuery, {
      replacements: {user_id: targetUserId}
    });

    const getFollowingCountPromise = sequelize.query(getFollowingCountQuery, {
      replacements: {user_id: targetUserId}
    });

    const isFollowingPromise = sequelize.query(isFollowingQuery, {
      replacements: {user_id_followed: req?.userId || '', user_id_follower: targetUserId}
    });

    const isMeFollowingTargetPromise = sequelize.query(isFollowingQuery, {
      replacements: {user_id_followed: targetUserId || '', user_id_follower: req?.userId || ''}
    });

    const selfAnonymousUserIdPromise = UsersFunction.findAnonymousUserId(User, req?.userId, {
      raw: true
    });

    const [
      getFollowerCount,
      getFollowingCount,
      isFollowing,
      isMeFollowingTarget,
      selfAnonymousUser
    ] = await Promise.all([
      getFollowerCountPromise,
      getFollowingCountPromise,
      isFollowingPromise,
      isMeFollowingTargetPromise,
      selfAnonymousUserIdPromise
    ]);

    const getFollowerCountResult = getFollowerCount?.[0]?.[0]?.count_follower;
    const getFollowingCountResult = getFollowingCount?.[0]?.[0]?.count_following;
    const isFollowingResult = isFollowing?.[0]?.length > 0;
    const isMeFollowingTargetResult = isMeFollowingTarget?.[0]?.length > 0;

    const copyUser = {...user.dataValues};

    delete copyUser.following;
    delete copyUser.follower;

    copyUser.following_symbol = checkMoreOrLess(getFollowingCountResult);
    copyUser.follower_symbol = checkMoreOrLess(getFollowerCountResult);

    if (req?.userId) {
      copyUser.is_following = isFollowingResult;
    }

    copyUser.isSignedMessageEnabled = true;
    copyUser.isAnonMessageEnabled = false;
    copyUser.is_me_following_target = isMeFollowingTargetResult;

    if (copyUser.allow_anon_dm) {
      if (copyUser.only_received_dm_from_user_following) {
        copyUser.isAnonMessageEnabled = copyUser.allow_anon_dm && isFollowingResult;
      } else {
        copyUser.isAnonMessageEnabled = copyUser.allow_anon_dm;
      }
    }

    copyUser.karma_score = roundingKarmaScore(copyUser.karma_score);

    const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
    try {
      client.connectUser({id: req.userId}, req.token);

      const existingAnonymousChannelPromise = ChatAnonUserInfo.findOne({
        where: {
          my_anon_user_id: selfAnonymousUser?.user_id,
          target_user_id: targetUserId,
          context: null
        },
        raw: true
      });

      const signedChannelPromise = client.queryChannels({
        type: 'messaging',
        members: {
          $eq: [targetUserId, req.userId]
        }
      });

      const [existingAnonymousChannel, signedChannels] = await Promise.all([
        existingAnonymousChannelPromise,
        signedChannelPromise
      ]);

      const signedChannel = signedChannels?.[0];

      if (signedChannel) {
        copyUser.signedChannelIdWithTargetUser = signedChannel?.id;
      }

      copyUser.anonymousChannelIdWithTargetUser = existingAnonymousChannel?.channel_id;
    } catch (error) {
      console.log('error', error);
    } finally {
      client.disconnectUser();
    }

    return res.status(200).json({
      status: 'success',
      code: 200,
      data: copyUser
    });
  } catch (error) {
    console.log('error', error);
    return res.status(500).json({
      code: error?.response?.status,
      status: 'error',
      message: error?.response?.data
    });
  }
};
