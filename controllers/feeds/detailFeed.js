const axios = require("axios");
const { getDetailFeed } = require("../../services/getstream");
const { responseSuccess } = require("../../utils/Responses");
module.exports = async (req, res) => {
  let id = req.query.id;
  let feed = await getDetailFeed(req.token, id);
  return res
    .status(200)
    .json(responseSuccess("success get detail feed", feed.results[0]));
};
