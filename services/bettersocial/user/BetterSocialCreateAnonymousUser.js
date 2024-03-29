const Getstream = require('../../../vendor/getstream');
const BetterSocialCreateUser = require('./BetterSocialCreateUser');

/**
 *
 * @param {GetstreamCreateUserParam} user
 * @returns
 */
const BetterSocialCreateAnonymousUser = async (user) => {
  if (user?.user_id === null || user?.user_id === undefined)
    throw new Error('user_id is required to create anonymous user');

  /**
   * @type {GetstreamCreateUserParam}
   */
  const anonymousUser = {
    profile_pic_url: '',
    username: '',
    user_id: user?.user_id,
    created_at: user?.created_at
  };

  await BetterSocialCreateUser(anonymousUser);
};

module.exports = BetterSocialCreateAnonymousUser;
