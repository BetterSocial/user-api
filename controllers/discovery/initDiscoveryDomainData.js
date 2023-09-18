const {QueryTypes} = require('sequelize');
const {sequelize} = require('../../databases/models');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
const InitDiscoveryDomainData = async (req, res) => {
  let {limit = 10, page = 0} = req.query;

  const userId = req.userId;

  try {
    let suggestedDomainsQuery = `SELECT 
                C.domain_name, C.short_description, C.logo, C.credder_score,
                A.domain_id_followed, 
                COUNT(*) as common,
                A.user_id_follower as user_id_follower
            FROM user_follow_domain A 
            INNER JOIN user_follow_domain B 
                ON A.domain_id_followed = B.domain_id_followed
                AND A.user_id_follower = :userId
            RIGHT JOIN domain_page C 
                ON C.domain_page_id = A.domain_id_followed
            GROUP BY A.domain_id_followed, domain_page_id, A.user_id_follower, C.domain_name, C.logo, C.short_description, C.credder_score
            ORDER BY 
                common DESC, 
                A.domain_id_followed ASC
            LIMIT :limit
            OFFSET :offset`;

    let domainWithCommonFollowerResult = await sequelize.query(suggestedDomainsQuery, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        limit: limit,
        offset: page * limit
      }
    });
    let suggestedDomains = domainWithCommonFollowerResult;

    return res.status(200).json({
      success: true,
      message: `Fetch discovery data success`,
      suggestedDomains,
      page: page + 1
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

module.exports = InitDiscoveryDomainData;
