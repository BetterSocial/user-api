const { sequelize } = require('../../databases/models')
const _ = require('lodash')

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @returns 
 */
const InitDiscoveryUserData = async (req, res) => {
    let { limit = 10, page = 0 } = req.body

    const userId = req.userId
    let allUsers = []

    try {
        let usersWithCommonFollowerQuery = `
        SELECT A.*, CommonUsers.common, B.user_id_follower from users A
            LEFT JOIN 
                (SELECT 
                    common.*,
                    joint.common,
                CASE WHEN joint.source = '${userId}' THEN 1 ELSE 0 END as user_match
                FROM users common
                JOIN 
                    vwm_user_common_follower_count joint
                ON common.user_id = joint.target
                WHERE joint.source = '${userId}') CommonUsers
        ON CommonUsers.user_id = A.user_id
        LEFT JOIN user_follow_user B
        ON A.user_id = B.user_id_followed AND B.user_id_follower = '${userId}'
        ORDER BY
        COALESCE(CommonUsers.common, -1) DESC, 
        COALESCE(CommonUsers.user_match, -1) DESC,
        COALESCE(B.user_id_follower, '') DESC
        LIMIT ${limit}
        OFFSET ${page * limit}`

        let usersWithCommonFollowerResult = await sequelize.query(usersWithCommonFollowerQuery)
        let suggestedUsers = usersWithCommonFollowerResult[0]

        return res.status(200).json({
            success: true,
            message: `Fetch discovery data success`,
            suggestedUsers,
            nextPage: page + 1,
        })
    } catch (e) {
        console.log('e')
        console.log(e)
        return res.status(200).json({
            success: false,
            message: e,
        })
    }
}

module.exports = InitDiscoveryUserData