const Validator = require('fastest-validator');
const BodyValidationSchema = require('./schema');

const v = new Validator();

const GenerateBodyValidationMiddleware = (schema) => {
  const middleware = (req, res, next) => {
    try {
      const validate = v.validate(req?.body, schema);
      if (validate.length) {
        return res.status(403).json({
          code: 403,
          status: 'error validation',
          message: validate
        });
      }
    } catch (e) {
      return res.status(409).json({
        code: 409,
        status: 'error validation',
        message: e
      });
    }

    return next();
  };

  return middleware;
};

const BodyValidationMiddleware = {
  blockAnonymousPostV2: GenerateBodyValidationMiddleware(BodyValidationSchema.blockAnonymousPostV2),
  blockUserV2: GenerateBodyValidationMiddleware(BodyValidationSchema.blockUserV2),
  checkHumanIdExchangeToken: GenerateBodyValidationMiddleware(
    BodyValidationSchema.checkHumanIdExchangeToken
  ),
  checkPasswordForDemoLogin: GenerateBodyValidationMiddleware(
    BodyValidationSchema.checkPasswordForDemoLogin
  ),
  checkUserFollowStatus: GenerateBodyValidationMiddleware(
    BodyValidationSchema.checkUserFollowStatus
  ),
  changeBio: GenerateBodyValidationMiddleware(BodyValidationSchema.changeBio),
  changeProfileImage: GenerateBodyValidationMiddleware(BodyValidationSchema.changeProfileImage),
  commonLimitOffset: GenerateBodyValidationMiddleware(BodyValidationSchema.commonLimitOffset),
  createAnonymousCommentChildV2: GenerateBodyValidationMiddleware(
    BodyValidationSchema.createAnonymousCommentChildV2
  ),
  createAnonymousCommentV2: GenerateBodyValidationMiddleware(
    BodyValidationSchema.createAnonymousCommentV2
  ),
  createAnonymousPollPostV2: GenerateBodyValidationMiddleware(
    BodyValidationSchema.createAnonymousPollPostV2
  ),
  createAnonymousPostV2: GenerateBodyValidationMiddleware(
    BodyValidationSchema.createAnonymousPostV2
  ),
  createCommentChildV2: GenerateBodyValidationMiddleware(BodyValidationSchema.createCommentChildV2),
  createCommentV2: GenerateBodyValidationMiddleware(BodyValidationSchema.createCommentV2),
  createPollPostV2: GenerateBodyValidationMiddleware(BodyValidationSchema.createPollPostV2),
  createPostV2: GenerateBodyValidationMiddleware(BodyValidationSchema.createPostV2),
  followUserV2: GenerateBodyValidationMiddleware(BodyValidationSchema.followUserV2),
  generateCommentAnonymousUsername: GenerateBodyValidationMiddleware(
    BodyValidationSchema.generateCommentAnonymousUsername
  ),
  generatePostAnonymousUsername: GenerateBodyValidationMiddleware(
    BodyValidationSchema.generatePostAnonymousUsername
  ),
  registerV2: GenerateBodyValidationMiddleware(BodyValidationSchema.registerV2),
  registerV2WithoutUpload: GenerateBodyValidationMiddleware(
    BodyValidationSchema.registerV2WithoutUpload
  ),
  setSignedChannelAsRead: GenerateBodyValidationMiddleware(
    BodyValidationSchema.setSignedChannelAsRead
  ),
  unblockUserV2: GenerateBodyValidationMiddleware(BodyValidationSchema.unblockUserV2),
  unfollowUserV2: GenerateBodyValidationMiddleware(BodyValidationSchema.unfollowUserV2),
  uploadPhoto: GenerateBodyValidationMiddleware(BodyValidationSchema.uploadPhoto),
  verifyUser: GenerateBodyValidationMiddleware(BodyValidationSchema.verifyUser)
};

module.exports = BodyValidationMiddleware;
