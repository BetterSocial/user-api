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
const SearchDomain = async (req, res) => {
    const { q } = req.query
    const userId = req.userId
    if (q.length < 2) return res.status(200).json({
        success: true,
        message: 'Your search characters is too few, please input 3 or more characters for search'
    })

    try {
        // const blockDomain = await getBlockDomain(req.userId);
        // const blockDomain = ["f0433444-8459-4b9a-969b-dc13f98580b3"]
        // let filteredBlockDomainArray = blockDomain instanceof Array ? blockDomain : JSON.parse(blockDomain)

        let domains = await sequelize.query(
            `SELECT 
                "Domain"."domain_page_id",
                "Domain"."domain_name",
				"Domain"."logo",
				"Domain"."short_description",
                "Domain"."credder_score",
                count("domainFollower"."user_id_follower") 
                    AS "followersCount",
                (SELECT "f"."user_id_follower" AS "user_id_follower" FROM "user_follow_domain" AS "f" WHERE "f"."user_id_follower" = :userId AND "f"."domain_id_followed" = "Domain"."domain_page_id")
            FROM "domain_page" 
                AS "Domain" 
            LEFT JOIN "user_follow_domain" 
                AS "domainFollower" 
            ON "Domain"."domain_page_id" = 
                "domainFollower"."domain_id_followed" 
            WHERE 
                "Domain"."domain_name" ILIKE :likeQuery 
            GROUP BY 
                "Domain"."domain_page_id",
                "Domain"."domain_name",
				"Domain"."logo",
				"Domain"."short_description",
                "Domain"."credder_score"
            ORDER BY
                "user_id_follower" ASC,
                "followersCount" DESC
            LIMIT 10`, {
            type: QueryTypes.SELECT,
            replacements: {
                userId,
                likeQuery: `%${q}%`
            }
        })

        let followedDomains = domains.filter((item, index) => {
            return item.user_id_follower !== null
        })

        let unfollowedDomains = domains.filter((item, index) => {
            return item.user_id_follower === null
        })

        return res.status(200).json({
            success: true,
            message: `Search ${q}`,
            followedDomains,
            unfollowedDomains,
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

module.exports = SearchDomain