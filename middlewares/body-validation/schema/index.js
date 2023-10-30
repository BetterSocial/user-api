/* eslint-disable global-require */
const BodyValidationSchema = {
  blockAnonymousPostV2: require('./blockAnonymousPostV2Schema'),
  blockUserV2: require('./blockUserV2Schema'),
  changeBio: require('./changeBioSchema'),
  changeProfileImage: require('./changeProfileImageSchema'),
  checkHumanIdExchangeToken: require('./checkHumanIdExchangeToken'),
  checkPasswordForDemoLogin: require('./checkPasswordForDemoLoginSchema'),
  checkUserFollowStatus: require('./checkUserFollowStatusSchema'),
  createAnonymousCommentChildV2: require('./createAnonymousCommentChildV2Schema'),
  createAnonymousCommentV2: require('./createAnonymousCommentV2Schema'),
  createAnonymousPollPostV2: require('./createAnonymousPollPostV2Schema'),
  createAnonymousPostV2: require('./createAnonymousPostV2Schema'),
  createCommentChildV2: require('./createCommentChildV2Schema'),
  createCommentV2: require('./createCommentV2Schema'),
  createPollPostV2: require('./createPollPostV2Schema'),
  createPostV2: require('./createPostV2Schema'),
  followUserV2: require('./followUserV2Schema'),
  generateCommentAnonymousUsername: require('./generateCommentAnonymousUsernameSchema'),
  generatePostAnonymousUsername: require('./generatePostAnonymousUsernameSchema'),
  registerV2: require('./registerV2Schema'),
  registerV2WithoutUpload: require('./registerV2WithoutUploadSchema'),
  setSignedChannelAsRead: require('./setSignedChannelAsReadSchema'),
  unblockUserV2: require('./unblockUserV2Schema'),
  unfollowUserV2: require('./unfollowUserV2Schema'),
  uploadPhoto: require('./uploadPhotoSchema'),
  verifyUser: require('./verifyUserSchema')
};

module.exports = BodyValidationSchema;
