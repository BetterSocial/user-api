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
      const { anonimity } = element;
      let copyReq = {
        body: element,
        userId: element.userId,
      };
      let { isSuccess, message } = await BetterSocialCore.post.createPost(
        copyReq,
        anonimity
      );
      console.log("message in loop", message);
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
