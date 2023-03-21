const { Topics } = require("../../databases/models");
const groupBy = require("lodash/groupBy");
module.exports = async (req, res) => {
  try {
    return Topics.findAll({
      where: { is_custom_topic: false },
      order: [["sort", "ASC"]],
    })
      .then((topics) => {
        const response = groupBy(topics, function (n) {
          return n.categories;
        });
        res.status(200).json({
          status: "success",
          code: 200,
          body: response,
        });
      })
      .catch((error) => res.status(400).json(error));
  } catch (error) {
    const { status, data } = error.response;
    return res.json({
      code: status,
      data: 0,
      message: data,
    });
  }
};
