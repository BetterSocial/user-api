const { User, Topics, UserFollowUser, sequelize, Sequelize, NewsLink, DomainPage } = require('../../databases/models')
const { Op, fn, col, QueryTypes } = require('sequelize')
const _ = require('lodash')
const { getDomain } = require('../../services/getstream')
const { getBlockDomain } = require('../../services/domain')
const { filter } = require('lodash')

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
                COUNT(*) as common 
            FROM user_topics A 
            INNER JOIN user_topics B 
                ON A.topic_id = B.topic_id 
                AND A.user_id != B.user_id 
                AND A.user_id = 'f19ce509-e8ae-405f-91cf-ed19ce1ed96e'
            RIGHT JOIN topics C 
                ON C.topic_id = A.topic_id
            GROUP BY A.topic_id, C.topic_id
            ORDER BY A.topic_id
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