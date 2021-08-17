const { getDomain } = require("../../services/getstream");
const { MAX_FEED_FETCH_LIMIT_DOMAIN } = require("../../helpers/constants");
const _ = require("lodash");
const { getBlockDomain } = require("../../services/domain");

module.exports = async (req, res) => {
  try {
    const query = {
      limit: req.query.limit || MAX_FEED_FETCH_LIMIT_DOMAIN,
      id_lt: req.query.id_lt || "",
      reactions: { own: true, recent: true, counts: true },
    };
    const resp = await getDomain(query);
    const blockDomain = await getBlockDomain(req.userId);

    let newResult = await _.filter(resp.results, function (o) {
      return !blockDomain.includes(o.content.domain_page_id);
    });

    res.status(200).json({
      code: 200,
      status: "success",
      data: newResult,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: null,
      message: "Internal server error",
      error: error,
    });
  }
};
