const {User} = require('../databases/models');
const UsersFunction = require('../databases/functions/users');

module.exports = {
  isChatToYourself: async (my_user_id, member) => {
    let user = await UsersFunction.findUserById(User, member);
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    const user_ids = new Set([user.user_id]);
    if (!user.is_anonymous) {
      const anon_user = await UsersFunction.findAnonymousUserId(User, user.user_id);
      user_ids.add(anon_user.user_id);
    } else {
      const sign_user = await UsersFunction.findSignedUserId(User, user.user_id);
      user_ids.add(sign_user.user_id);
    }

    const isChattingToSelf = user_ids.has(my_user_id);
    return {
      success: !isChattingToSelf,
      message: isChattingToSelf ? 'Cannot chat to yourself' : 'Success'
    };
  }
};
