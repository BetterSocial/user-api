const getstreamService = require("../../services/getstream");
const { User, Locations } = require("../../databases/models");

const Validator = require("fastest-validator");
const v = new Validator();

const moment = require("moment");
const cloudinary = require("cloudinary");
const formatLocationGetStream = require("../../helpers/formatLocationGetStream");
const { POST_TYPE_STANDARD, POST_VERB_POLL } = require("../../helpers/constants");
const { addForCreatePost } = require("../../services/score");
const { handleCreatePostTO, filterAllTopics, insertTopics } = require("../../utils/post");
const emojiUnicode = require("emoji-unicode");
const { convertTopicWithEmoji } = require("../../utils");
const ErrorResponse = require("../../utils/response/ErrorResponse");
const BetterSocialCore = require("../../services/bettersocial");
const SuccessResponse = require("../../utils/response/SuccessResponse");

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
module.exports = async (req, res) => {
  try {
    const { anonimity } = req?.body
    await BetterSocialCore.post.createPost(req, anonimity)
    return SuccessResponse(res, "Post created successfully")
  } catch (e) {
    return ErrorResponse.e500(res, e.message)
  }
};
