const BodyValidationSchema = {
    createAnonymousPostV2: require('./createAnonymousPostV2Schema'),
    createAnonymousPollPostV2: require('./createAnonymousPollPostV2Schema'),
    createPostV2: require('./createPostV2Schema'),
    createPollPostV2: require('./createPollPostV2Schema'),
    followUserV2: require('./followUserV2Schema'),
    unfollowUserV2: require('./unfollowUserV2Schema'),
    registerV2: require('./registerV2Schema'),
}

module.exports = BodyValidationSchema