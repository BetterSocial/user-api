const UsersFunction = {
    register: require('./users-register'),
    registerAnonymous: require('./users-register-anonymous'),
    findAnonymousUserId: require('./find-anonymous-user-id'),
    findUserById: require('./find-user-by-id'),
    findUserByHumanId: require('./find-user-by-human-id'),
    findSignedUserId: require('./find-signed-user-id'),
    findActorId: require('./find-actor-id')
}

module.exports = UsersFunction;