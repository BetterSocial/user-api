const stream = require("getstream");
const client = stream.connect(process.env.API_KEY, process.env.SECRET);

/**
 * 
 * @param {string} userId 
 * @returns {string}
 */
const createToken = (userId = null) => {
    if(!userId) throw new Error("userId is required");
 
    const DAYS_IN_SECONDS = 24 * 60 * 60
    let exp = Math.floor(Date.now() / 1000) + (30 * DAYS_IN_SECONDS);
    return client.createUserToken(userId, { exp: exp });
}

module.exports = createToken