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
const Search = async (req, res) => {
    const { q } = req.query
    const userId = req.userId
    if (q.length < 2) return res.status(200).json({
        success: true,
        message: 'Your search characters is too few, please input 3 or more characters for search'
    })

    try {
        let topics = await sequelize.query(
            `SELECT 
            "Topic".*,
            count("topicFollower"."user_id") 
                AS "followersCount",
            (SELECT "f"."user_id" AS "user_id_follower" FROM "user_topics" AS f WHERE "f"."user_id" ='${userId}' AND "f"."topic_id" = "Topic"."topic_id")
        FROM "topics" 
            AS "Topic" 
        LEFT OUTER JOIN "user_topics" 
            AS "topicFollower" 
        ON "Topic"."topic_id" = 
            "topicFollower"."topic_id" 
        WHERE 
            "Topic"."name" ILIKE '%${q}%' 
        GROUP BY 
            "Topic"."topic_id"
        ORDER BY
            "user_id_follower" ASC,
            "followersCount" DESC
            LIMIT 10`, { type: QueryTypes.SELECT })

        let followedTopic = topics.filter((item, index) => {
            return item.user_id_follower !== null
        })

        let unfollowedTopic = topics.filter((item, index) => {
            return item.user_id_follower === null
        })

        return res.status(200).json({
            success: true,
            message: `Search ${q}`,
            followedTopic,
            unfollowedTopic,
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

module.exports = Search