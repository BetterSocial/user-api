const UsersFunction = require('../databases/functions/users')
const {User} = require ('../databases/models')


const getAnonymUser = async ( userId) => {
     try {
        const myAnonymousId = await UsersFunction.findAnonymousUserId(User, userId)
     return myAnonymousId.user_id
     } catch(e) {
        return userId
     }
}

module.exports = {
    getAnonymUser
}