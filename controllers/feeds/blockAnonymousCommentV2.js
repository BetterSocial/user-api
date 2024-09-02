const BetterSocialCore = require('../../services/bettersocial');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');

module.exports = async (req, res) => {
  const {token, userId: selfUserId} = req;
  const {postId, commentId, source = '', reason = [], message = ''} = req.body;

  let response = await BetterSocialCore.post.blockAnonymousComment(
    res,
    token,
    selfUserId,
    postId,
    commentId,
    source,
    {
      message,
      reason
    }
  );
  if (response?.isSuccess) {
    return SuccessResponse(
      res,
      null,
      response?.message || 'This Anonymous comment has been blocked successfully'
    );
  }

  return ErrorResponse.e500(res, response?.message || 'Error in block anonymous comment');
};
