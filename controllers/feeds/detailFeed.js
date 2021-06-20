const axios = require("axios");
module.exports = async (req, res) => {
  let api_key = process.env.API_KEY;
  let id = req.query.id;
  const config = {
    method: "get",
    url: `https://us-east-api.stream-io-api.com/api/v1.0/activities/?api_key=${api_key}&ids=${id}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${req.token}`,
    },
  };
  axios(config)
    .then((res) => res.data.results)
    .then((result) => {
      res.status(200).json({
        code: 200,
        status: "success get detail post",
        data: result[0],
      });
    })
    .catch((err) => {
      return res.json(err);
    });
};
