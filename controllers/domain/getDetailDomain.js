const { getDetailDomain } = require("../../services/getstream");
const { MAX_FEED_FETCH_LIMIT } = require("../../helpers/constants");
const { convertDotToSlug } = require("../../utils");

module.exports = async (req, res) => {
  try {
    const query = {
      name: req.params.name,
      idFeed: convertDotToSlug(req.params.idfeed, ".", "-"),
      limit: req.query.limit || MAX_FEED_FETCH_LIMIT,
      id_lt: req.query.id_lt || "",
      reactions: { own: true, recent: true, counts: true },
    };
    const resp = await getDetailDomain(query);
    res.status(200).json({
      code: 200,
      status: "success",
      data: resp?.results,
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
