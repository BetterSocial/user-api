const { User, Topics, UserFollowUser, sequelize, Sequelize } = require('../../databases/models')
const { Op, fn, col, QueryTypes } = require('sequelize')
const _ = require('lodash')
const { getDomain } = require('../../services/getstream')
const { getBlockDomain } = require('../../services/domain')

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @returns 
 */
const Search = async(req, res) => {
    const { q } = req.query
    const userId = req.userId
    if(q.length < 2) return res.status(200).json({
        success: true,
        message: 'Your search characters is too few, please input 3 or more characters for search'
    })

    try {
        const query = {
            limit: 20,
            id_lt: req.query.id_lt || "",
            reactions: { own: true, recent: true, counts: true },
        };
        const resp = await getDomain(query);
        const blockDomain = await getBlockDomain(req.userId);
    
        let news = await _.filter(resp.results, function (o) {
            return !blockDomain.includes(o.content.domain_page_id) && (o.content.title.toLowerCase().indexOf(q) > -1);
        });

        let users = await sequelize.query(
            `SELECT 
                "User".*,
                count("follower"."user_id_follower") 
                    AS "followersCount",
                (SELECT 
                    "f"."user_id_follower" AS "user_id_follower"
                FROM "user_follow_user" AS f 
                WHERE "f"."user_id_follower" ='${userId}' 
                    AND "f"."user_id_followed" = "User"."user_id")
            FROM "users" 
                AS "User" 
            LEFT OUTER JOIN "user_follow_user" 
                AS "follower" 
            ON "User"."user_id" = 
                "follower"."user_id_followed" 
            WHERE 
                ("User"."username" ILIKE '%${q}%' 
                AND 
                "User"."user_id" != '${userId}') 
            GROUP BY 
                "User"."user_id"
            ORDER BY 
                "user_id_follower" ASC,
                "followersCount" DESC
            LIMIT 10`, { type: QueryTypes.SELECT})

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

        let domains = await sequelize.query(
            `SELECT 
                "Domain"."domain_page_id",
                "Domain"."domain_name",
				"Domain"."logo",
				"Domain"."short_description",
                count("domainFollower"."user_id_follower") 
                    AS "followersCount",
                (SELECT "f"."user_id_follower" AS "user_id_follower" FROM "user_follow_domain" AS "f" WHERE "f"."user_id_follower" ='${userId}' AND "f"."domain_id_followed" = "Domain"."domain_page_id")
            FROM "domain_page" 
                AS "Domain" 
            LEFT JOIN "user_follow_domain" 
                AS "domainFollower" 
            ON "Domain"."domain_page_id" = 
                "domainFollower"."domain_id_followed" 
            WHERE 
                "Domain"."domain_name" ILIKE '%${q}%' 
            GROUP BY 
                "Domain"."domain_page_id",
                "Domain"."domain_name",
				"Domain"."logo",
				"Domain"."short_description"
            ORDER BY
                "user_id_follower" ASC,
                "followersCount" DESC
            LIMIT 10`, { type: QueryTypes.SELECT })

        let followedDomains = domains.filter((item, index) => {
            return item.user_id_follower !== null
        })

        let unfollowedDomains = domains.filter((item, index) => {
            return item.user_id_follower === null
        })

        let followedUsers = users.filter((item, index) => {
            return item.user_id_follower !== null
        })

        let unfollowedUsers = users.filter((item, index) => {
            return item.user_id_follower === null
        })

        let followedTopic = topics.filter((item, index) => {
            return item.user_id_follower !== null
        })

        let unfollowedTopic = topics.filter((item, index) => {
            return item.user_id_follower === null
        })

        return res.status(200).json({
            success: true,
            message: `Search ${q}`,
            followedDomains,
            unfollowedDomains,
            followedUsers,
            unfollowedUsers,
            followedTopic,
            unfollowedTopic,
            news
        })
    }catch(e) {
        return res.status(200).json({
            success: false,
            message: e,
        })
    }
}

module.exports =  Search