const { sequelize } = require('../../databases/models')

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const chatSearch = async(req, res) => {
    const {q} = req.query
    const userId = req.userId

    let followedUserSearchQuery = `
        SELECT B.user_id_follower, B.user_id_followed,* 
        FROM users A 
        INNER JOIN user_follow_user B
        ON B.user_id_follower = '${userId}' AND B.user_id_followed = A.user_id
        WHERE 
            A.username ILIKE '%${q}%' AND 
            A.user_id != '${userId}'
        LIMIT 5`

    let followedUserSearchQueryResult = await sequelize.query(followedUserSearchQuery)
    let followed = followedUserSearchQueryResult[0]

    let followedUserId = followed.map((item) => `'${item.user_id}'`)

    let moreUserSearchQuery = `
        SELECT B.user_id_follower, B.user_id_followed ,* 
        FROM users A 
        LEFT JOIN user_follow_user B
        ON B.user_id_followed = '${userId}' AND B.user_id_follower = A.user_id
        WHERE 
            A.username ILIKE '%${q}%' AND 
            A.user_id != '${userId}' AND
            A.user_id NOT IN (${followedUserId.join(',')})
        ORDER BY B.user_id_followed
        LIMIT 5`

    let moreUserSearchQueryResult = await sequelize.query(moreUserSearchQuery)
    let moreUsers = moreUserSearchQueryResult[0]

    return res.status(200).json({
        success: true,
        message: `search result for ${q}`,
        followed,
        moreUsers,
    })
}

module.exports = chatSearch