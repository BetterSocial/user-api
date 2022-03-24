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
const SearchUser = async(req, res) => {
    const { q } = req.query
    const userId = req.userId
    if(q.length < 2) return res.status(200).json({
        success: true,
        message: 'Your search characters is too few, please input 3 or more characters for search'
    })

    try {
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

        let followedUsers = users.filter((item, index) => {
            return item.user_id_follower !== null
        })

        let unfollowedUsers = users.filter((item, index) => {
            return item.user_id_follower === null
        })

        return res.status(200).json({
            success: true,
            message: `Search ${q}`,
            followedUsers,
            unfollowedUsers,
        })
    }catch(e) {
        console.log('e')
        console.log(e)
        return res.status(200).json({
            success: false,
            message: e,
        })
    }
}

module.exports =  SearchUser