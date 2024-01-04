const getPlainFeedById = require('./getPlainFeedById');
const getReactionById = require('./getReactionById');
const ErrorResponse = require('../../../utils/response/ErrorResponse');

const GetUserIdFromSource = async (
  res,
  source,
  id = {post_id: '', comment_id: '', user_id: ''}
) => {
  if (source === 'post') {
    let post;
    try {
      post = await getPlainFeedById(id.post_id);
    } catch (error) {
      ErrorResponse.e403(res, 'Post id not found');
    }
    if (!post) return ErrorResponse.e403(res, 'Post id not found');

    return post?.actor?.id;
  } else if (source === 'comment') {
    try {
      const reaction = await getReactionById(id.comment_id);

      if (!reaction) return ErrorResponse.e403(res, 'Comment id not found');

      return reaction?.user?.id;
    } catch (error) {
      return ErrorResponse.e403(res, 'Comment id not found');
    }
  }
  return id.user_id;
};

module.exports = GetUserIdFromSource;
