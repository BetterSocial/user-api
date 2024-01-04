const {QueryTypes} = require('sequelize');
const {sequelize} = require('../../databases/models');
const {CREDDER_MIN_SCORE} = require('../../helpers/constants');

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
    let totalDataQuery = `SELECT 
                              count(A.domain_page_id) as total_data
                          FROM domain_page A 
                          WHERE A.credder_score >= :credderMinScore AND A.status = true
                          `;

    let suggestedDomainsQuery = `SELECT 
                C.domain_page_id,
                C.domain_name, C.short_description, C.logo, C.credder_score,
                C.domain_page_id AS domain_id_followed, 
                COUNT(*) as common,
                A.user_id_follower as user_id_follower
            FROM user_follow_domain A 
            INNER JOIN user_follow_domain B 
                ON A.domain_id_followed = B.domain_id_followed
                AND A.user_id_follower = :userId
            RIGHT JOIN domain_page C 
                ON C.domain_page_id = A.domain_id_followed
            WHERE C.credder_score >= :credderMinScore AND C.status = true
            GROUP BY A.domain_id_followed, domain_page_id, A.user_id_follower, C.domain_name, C.logo, C.short_description, C.credder_score
            ORDER BY 
                common DESC, 
                A.domain_id_followed ASC,
                C.credder_score DESC
            LIMIT :limit
            OFFSET :offset`;

    let domainWithCommonFollowerResult = await sequelize.query(suggestedDomainsQuery, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        limit: limit,
        offset: page * limit,
        credderMinScore: CREDDER_MIN_SCORE
      }
    });
    let suggestedDomains = domainWithCommonFollowerResult;

    let totalData = await sequelize.query(totalDataQuery, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        credderMinScore: CREDDER_MIN_SCORE
      },
      raw: true
    });
    totalData = totalData?.[0]?.total_data || 0;

    return res.status(200).json({
      success: true,
      message: `Fetch discovery data success`,
      suggestedDomains,
      page: page + 1,
      total_page: totalData > 0 && limit > 0 ? Math.ceil(totalData / limit) : 0,
      limit: limit,
      offset: page * limit
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
