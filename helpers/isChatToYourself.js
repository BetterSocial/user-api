const {User} = require('../databases/models');
const UsersFunction = require('../databases/functions/users');

module.exports = {
  isChatToYourself: async (my_user_id, member) => {
    if (my_user_id === member) return {success: false, message: 'Cannot chat to yourself'};
    let user = await UsersFunction.findUserById(User, member);
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    const userIds = new Set([user.user_id]);
    if (!user.is_anonymous) {
      const anon_user = await UsersFunction.findAnonymousUserId(User, user.user_id);
      userIds.add(anon_user.user_id);
    } else {
      const sign_user = await UsersFunction.findSignedUserId(User, user.user_id);
      userIds.add(sign_user.user_id);
    }

    const isChattingToSelf = userIds.has(my_user_id);
    return {
      success: !isChattingToSelf,
      message: isChattingToSelf ? 'Cannot chat to yourself' : 'Success'
    };
  }
};
