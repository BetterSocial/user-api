const UsersFunction = {
    register: require('./users-register'),
    registerAnonymous: require('./users-register-anonymous'),
    findAnonymousUserId: require('./find-anonymous-user-id'),
}

module.exports = UsersFunction;