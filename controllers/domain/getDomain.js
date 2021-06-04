const { getDomain } = require("../../services/getstream");
const {
  MAX_FEED_FETCH_LIMIT,
} = require("../../helpers/constants");

module.exports = async (req, res) => {
  try {
    const query = {
      limit: req.query.limit || MAX_FEED_FETCH_LIMIT,
      id_lt: req.query.id_lt || "",
      reactions: { own: true, recent: true, counts: true },
    }
    const resp = await getDomain(query);
    res.status(200).json({
      code: 200,
      status: "success",
      data: resp.results,
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
