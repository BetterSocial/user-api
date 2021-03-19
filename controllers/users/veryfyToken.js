const apiAdapter = require("../../routes/apiAdapter");
const { HUMANID_URL, HUMANID_CLIENT_ID, HUMANID_CLIENT_SECRET } = process.env;
const api = apiAdapter(HUMANID_URL);
module.exports = async (req, res) => {
  try {
    const token = await req.token;
    api.defaults.headers.common["Content-Type"] = "application/json";
    api.defaults.headers.common["client-id"] = HUMANID_CLIENT_ID;
    api.defaults.headers.common["client-secret"] = HUMANID_CLIENT_SECRET;
    const data = await api.post("server/users/exchange", {
      exchangeToken: token,
    });

    return res.json({
      code: 200,
      data: data,
      message: "success",
    });
  } catch (error) {
    const { status, data } = error.response;
    return res.json({
      code: status,
      data: "",
      message: data.message,
    });
  }
};
