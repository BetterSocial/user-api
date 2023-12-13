const UsersFunction = require('../users');

/**
 *
 * @typedef {Object} CheckSelfUsernameInPostParams
 * @property {string} userId
 * @property {string} postId
 */
/**
 *
 * @param {Model} postAnonUserInfoModel
 * @param {Model} userModel
 * @param {CheckSelfUsernameInPostParams} data
 * @param {Transaction} transaction
 * @param {boolean} is_anonymous
 * @returns
 */
module.exports = async (
  postAnonUserInfoModel,
  userModel,
  data,
  transaction = null,
  is_anonymous = true
) => {
  const {userId, postId} = data;

  let anon_user_id;
  if (!is_anonymous) {
    const anonymousUser = await UsersFunction.findAnonymousUserId(userModel, userId);
    anon_user_id = anonymousUser?.user_id;
  } else {
    anon_user_id = userId;
  }

  let postAnonUserInfo = await postAnonUserInfoModel.findOne(
    {
      where: {
        post_id: postId,
        anon_user_id
      },
      raw: true
    },
    {transaction}
  );

  return postAnonUserInfo;
};
