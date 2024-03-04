const {User, UserFollowUser} = require('../../databases/models');
const UsersFunction = require('../../databases/functions/users');
const UserFollowUserFunction = require('../../databases/functions/userFollowUser');
const Getstream = require('../../vendor/getstream');

module.exports = async (req, res) => {
  const {userId: self_user_id} = req;
  let {source, post_id, comment_id} = req.query;

  const target_user_id = await Getstream.feed.getUserIdFromSource(res, source, {
    post_id,
    comment_id
  });

  let user = await User.findOne(
    {where: {user_id: target_user_id}},
    'user_id allow_anon_dm only_received_dm_from_user_following'
  );

  if (user) {
    let following_status;
    if (user?.only_received_dm_from_user_following) {
      const signedUserId = await UsersFunction.findSignedUserId(User, target_user_id);
      const currentUserStatus = await UserFollowUserFunction.checkTargetUserFollowStatus(
        UserFollowUser,
        self_user_id,
        signedUserId
      );

      if (!currentUserStatus?.isTargetFollowingMe) {
        following_status = false;
      } else {
        following_status = true;
      }
    }

    return res.status(200).json({
      status: 'success',
      user: {
        id: target_user_id,
        allow_anon_dm: user.allow_anon_dm,
        only_received_dm_from_user_following: user.only_received_dm_from_user_following,
        following_status
      }
    });
  } else {
    return res.status(400).json({
      status: 'error',
      message: 'User Not Found'
    });
  }
};
