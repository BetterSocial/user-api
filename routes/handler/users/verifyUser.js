const apiAdapter = require("../../apiAdapter");
const { HUMANID_URL, HUMANID_CLIENT_ID, HUMANID_CLIENT_SECRET } = process.env;
const api = apiAdapter(HUMANID_URL);
const { User } = require("../../../database/models");
module.exports = async (req, res) => {
  try {
    const token = req.token;
    api.defaults.headers.common["Content-Type"] = "application/json";
    api.defaults.headers.common["client-id"] = HUMANID_CLIENT_ID;
    api.defaults.headers.common["client-secret"] = HUMANID_CLIENT_SECRET;
    const data = await api.post("server/users/exchange", {
      exchangeToken: JSON.stringify(token),
    });
    // const user = await User.findOne({ where: { human_id: "text12" } });
    // const user = await User.findAll();

    console.log(typeof token);
    console.log(token);
    console.log(data);
    return res.json(data);
  } catch (error) {
    // console.log("tokn ", JSON.stringify(req.token));
    const { status, data } = error.response;
    return res.status(status).json(data);
  }
};
