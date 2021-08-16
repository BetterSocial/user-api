const { getDomain } = require("../../services/getstream");
const { MAX_FEED_FETCH_LIMIT } = require("../../helpers/constants");
const { setValue, getValue } = require("../../services/redis");
const { UserBlockedDomain } = require("../../databases/models");
const _ = require("lodash");

module.exports = async (req, res) => {
  try {
    const query = {
      limit: req.query.limit || MAX_FEED_FETCH_LIMIT,
      id_lt: req.query.id_lt || "",
      reactions: { own: true, recent: true, counts: true },
    };
    const MY_KEY = "DOMAIN_" + req.userId;
    const cache = await getValue(MY_KEY);
    if (cache) {
      return res.status(200).json({
        code: 200,
        status: "success",
        data: JSON.parse(cache),
      });
    }

    const resp = await getDomain(query);
    const domainBlock = await UserBlockedDomain.findAll({
      attributes: ["domain_page_id"],
      where: {
        user_id_blocker: req.userId,
      },
    });
    let newResult = await _.filter(resp.results, function (o) {
      return !JSON.stringify(domainBlock).includes(o.content.domain_page_id);
    });
    setValue(MY_KEY, JSON.stringify(newResult));
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
