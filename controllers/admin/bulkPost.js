const BetterSocialCore = require("../../services/bettersocial");
const ErrorResponse = require("../../utils/response/ErrorResponse");
const SuccessResponse = require("../../utils/response/SuccessResponse");

const bulkPostController = async (req, res) => {
  try {
    let { post } = req?.body;
    if (post.length < 1) {
      return ErrorResponse.e400(res, "Data not null");
    }
    for (let index = 0; index < post.length; index++) {
      const element = post[index];
      const { anonimity: anonymity } = element;
      await BetterSocialCore.post.createPost(req, anonymity);
    }
    return SuccessResponse(res, "Post created successfully");
  } catch (e) {
    return ErrorResponse.e500(res, e.message);
  }
};

module.exports = bulkPostController;
