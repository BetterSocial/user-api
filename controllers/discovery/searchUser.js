const {QueryTypes} = require('sequelize');

const {sequelize} = require('../../databases/models');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
const SearchUser = async (req, res) => {
  const {q, limit = 50} = req.query;
  const {userId} = req;
  if (q.length < 2)
    return res.status(200).json({
      success: true,
      message: 'Your search characters is too few, please input 3 or more characters for search'
    });

  try {
    const users = await sequelize.query(
      `SELECT 
                "User".*,
                count("follower"."user_id_follower") 
                    AS "followersCount",
                (SELECT 
                    "f"."user_id_follower" AS "user_id_follower"
                FROM "user_follow_user" AS f 
                WHERE "f"."user_id_follower" = :userId
                    AND "f"."user_id_followed" = "User"."user_id")
            FROM "users" 
                AS "User" 
            LEFT OUTER JOIN "user_follow_user" 
                AS "follower" 
            ON "User"."user_id" = 
                "follower"."user_id_followed" 
            WHERE 
                ("User"."username" ILIKE :likeQuery
                AND "User"."user_id" != :userId
                AND "User"."is_anonymous" = false
                AND "User"."is_banned" = false) 
            GROUP BY 
                "User"."user_id"
            ORDER BY 
                "user_id_follower" ASC,
                "followersCount" DESC
            LIMIT :limit`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          likeQuery: `%${q}%`,
          userId,
          limit
        }
      }
    );

    const followedUsers = users.filter((item) => item.user_id_follower !== null);

    const unfollowedUsers = users.filter((item) => item.user_id_follower === null);

    return res.status(200).json({
      success: true,
      message: `Search ${q}`,
      followedUsers,
      unfollowedUsers
    });
  } catch (e) {
    console.log('e');
    console.log(e);
    return res.status(200).json({
      success: false,
      message: e
    });
  }
};

module.exports = SearchUser;
