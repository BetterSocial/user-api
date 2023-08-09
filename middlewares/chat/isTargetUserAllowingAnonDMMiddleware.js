const {User, UserFollowUser} = require('../../databases/models');
const UsersFunction = require('../../databases/functions/users');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const UserFollowUserFunction = require('../../databases/functions/userFollowUser');

const isTargetUserAllowingAnonDMMiddleware = async (req, res, next) => {
  const {members} = req?.body || {};

  if (!members) return ErrorResponse.e400(res, 'Members is required');
  if (members.length < 1) return ErrorResponse.e400(res, 'Members cannot be empty');

  const targetMember = members[0];
  const user = await UsersFunction.findUserById(User, targetMember);
  if (!user) return ErrorResponse.e400(res, 'User not found');

  if (!user?.allow_anon_dm)
    return ErrorResponse.e400(res, 'This user does not want to receive anonymous messages');

  if (user?.only_received_dm_from_user_following) {
    const signedUserId = await UsersFunction.findSignedUserId(User, req?.userId);
    const currentUserStatus = await UserFollowUserFunction.checkTargetUserFollowStatus(
      UserFollowUser,
      signedUserId,
      user?.user_id
    );

    if (!currentUserStatus?.isTargetFollowingMe)
      return ErrorResponse.e400(res, 'This user does not want to receive anonymous messages');
  }

  return next();
};

module.exports = isTargetUserAllowingAnonDMMiddleware;
