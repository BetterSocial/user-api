const UsersFunction = require('../databases/functions/users')
const {User} = require ('../databases/models')


const getAnonymUser = async ( userId) => {
     const myAnonymousId = await UsersFunction.findAnonymousUserId(User, userId)
     return myAnonymousId.user_id
}

module.exports = {
    getAnonymUser
}