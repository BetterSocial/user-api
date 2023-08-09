const {User, UserFollowUser} = require('../../../databases/models');
const UsersFunction = require('../../../databases/functions/users');
const UserFollowUserFunction = require('../../../databases/functions/userFollowUser');

const BetterSocialCheckIsTargetAllowingAnonDM = async (selfUserId, targetUserId) => {
  const targetMember = targetUserId;
  const user = await UsersFunction.findUserById(User, targetMember);
  if (!user) throw new Error('User not found');

  if (!user?.allow_anon_dm)
    throw new Error('This user does not want to receive anonymous messages');

  if (user?.only_received_dm_from_user_following) {
    const signedUserId = await UsersFunction.findSignedUserId(User, selfUserId);
    const currentUserStatus = await UserFollowUserFunction.checkTargetUserFollowStatus(
      UserFollowUser,
      signedUserId,
      user?.user_id
    );

    if (!currentUserStatus?.isTargetFollowingMe) {
      throw new Error('This user does not want to receive anonymous messages');
    }
  }

  return true;
};

module.exports = BetterSocialCheckIsTargetAllowingAnonDM;
