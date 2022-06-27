const { sequelize } = require('../../databases/models')

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @returns 
 */
const InitDiscoveryTopicData = async (req, res) => {
    let { limit = 10, page = 0 } = req.query

    const userId = req.userId

    try {
        let suggestedTopicsQuery = `SELECT 
                C.*, 
                A.topic_id, 
                COUNT(*) as common,
                A.user_id as user_id_follower
            FROM user_topics A 
            INNER JOIN user_topics B 
                ON A.topic_id = B.topic_id 
                AND A.user_id = '${userId}'
            RIGHT JOIN topics C 
                ON C.topic_id = A.topic_id
            GROUP BY A.topic_id, C.topic_id, A.user_id
            ORDER BY common DESC, A.topic_id ASC
            LIMIT ${limit}
            OFFSET ${page * limit}`

        let topicWithCommonFollowerResult = await sequelize.query(suggestedTopicsQuery)
        let suggestedTopics = topicWithCommonFollowerResult[0]

        return res.status(200).json({
            success: true,
            message: `Fetch discovery data success`,
            suggestedTopics,
            page: page + 1,
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

module.exports = InitDiscoveryTopicData