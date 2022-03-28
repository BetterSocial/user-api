const {UserFollowDomain, DomainPage} = require('../../databases/models')
const { getDetailDomain } = require("../../services/getstream");
const {
    MAX_FEED_FETCH_LIMIT,
    GETSTREAM_RANKING_METHOD,
} = require("../../helpers/constants");
const { convertString } = require("../../utils");

module.exports = async (req, res) => {
  try {
    const query = {
      name: "domain",
      idFeed: convertString(req.params.idfeed, ".", "-"),
      limit: req.query.limit || MAX_FEED_FETCH_LIMIT,
      id_lt: req.query.id_lt || "",
      reactions: { own: true, recent: true, counts: true },
      ranking: GETSTREAM_RANKING_METHOD,
    };
    console.log(query);
    const resp = await getDetailDomain(query);

    let domain = await DomainPage.findOne({
      where : {
        domain_name : req.params.idfeed
      }
    })

    let {count} = await UserFollowDomain.findAndCountAll({
      where : {
        domain_id_followed : domain.domain_page_id
      }
    })

    res.status(200).json({
      code: 200,
      status: "success",
      followers : count,
      data: resp?.results,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      data: null,
      followers : 0,
      message: "Internal server error",
      error: error,
    });
  }
};
