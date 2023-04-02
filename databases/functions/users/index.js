const UsersFunction = {
    register: require('./users-register'),
    registerAnonymous: require('./users-register-anonymous'),
    findAnonymousUserId: require('./find-anonymous-user-id'),
    findUserById: require('./find-user-by-id'),
    findSignedUserId: require('./find-signed-user-id')
}

module.exports = UsersFunction;