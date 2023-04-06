const BetterSocialCore = require("../../services/bettersocial");
const ErrorResponse = require("../../utils/response/ErrorResponse");
const SuccessResponse = require("../../utils/response/SuccessResponse");
const { LogError } = require("../../databases/models");
const createToken = require("../../vendor/getstream/core/createToken");

const bulkPostController = async (req, res) => {
  console.log("bulk post");
  try {
    let { post } = req?.body;
    if (post.length < 1) {
      return ErrorResponse.e400(res, "Data not null");
    }
    for (let index = 0; index < post.length; index++) {
      const element = post[index];
      const { anonimity, userId } = element;
      let token = await createToken(userId);
      let request = {
        body: element,
        token: token,
        userId: userId,
      };
      req.body = element;
      req.token = token;
      let { isSuccess, message } = await BetterSocialCore.post.createPost(
        request,
        anonimity
      );
      if (!isSuccess) {
        console.log(message);
        let messageForInsert = {
          process: `bulk insert user ${element.userId}`,
          message: message,
        };

        LogError.create({
          message: JSON.stringify(messageForInsert),
        });
      }
    }
    return SuccessResponse(res, "Post created successfully");
  } catch (e) {
    return ErrorResponse.e500(res, e.message);
  }
};

module.exports = bulkPostController;
