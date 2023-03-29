const BodyValidationSchema = {
    blockUserV2: require('./blockUserV2Schema'),
    changeBio: require('./changeBioSchema'),
    changeProfileImage: require('./changeProfileImageSchema'),
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
    unfollowUserV2: require('./unfollowUserV2Schema'),
}

module.exports = BodyValidationSchema