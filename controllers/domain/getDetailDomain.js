const { UserFollowDomain, DomainPage } = require('../../databases/models')
const { getDetailDomain } = require("../../services/getstream");
const {
  MAX_FEED_FETCH_LIMIT,
  GETSTREAM_RANKING_METHOD,
} = require("../../helpers/constants");
const { convertString } = require("../../utils");

module.exports = async (req, res) => {
  let { limit = MAX_FEED_FETCH_LIMIT, offset = 0 } = req.query

  try {
    const query = {
      name: "domain",
      idFeed: convertString(req.params.idfeed, ".", "-"),
      limit,
      offset,
      reactions: { own: true, recent: true, counts: true },
      ranking: GETSTREAM_RANKING_METHOD,
    };
    let domain = await DomainPage.findOne({
      where: {
        domain_name: req.params.idfeed
      }
    })

    let followers = 0;
    if (domain?.domain_page_id) {
      let { count } = await UserFollowDomain.findAndCountAll({
        where: {
          domain_id_followed: domain.domain_page_id
        }
      })

      followers = count
    }

    console.log(query);
    const resp = await getDetailDomain(query);

    res.status(200).json({
      code: 200,
      status: "success",
      followers,
      data: resp?.results,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      data: null,
      followers: 0,
      message: "Internal server error",
      error: error,
    });
  }
};
