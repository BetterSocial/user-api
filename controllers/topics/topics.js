const { Topics, LimitTopics } = require("../../databases/models");
const groupBy = require("lodash/groupBy");
const mapValues = require("lodash/mapValues"); // added to map over grouped data
const pick = require("lodash/pick"); // added to pick specific attributes from the topic object

module.exports = async (req, res) => {
  try {
    let limits = await LimitTopics.findAll({
      attributes: ["limit"],
      order: [["id", "DESC"]],
      limit: 1,
    });
    let limit = limits[0].limit;
    Topics.findAll({
      where: { is_custom_topic: false, deleted_at: null },
      order: [["sort", "ASC"]],
    })
      .then((topics) => {
        const groupedTopics = groupBy(topics, (n) => n.categories);
        const limitedTopics = mapValues(groupedTopics, (group) =>
          group
            .slice(0, limit)
            .map((topic) =>
              pick(topic, [
                "topic_id",
                "name",
                "icon_path",
                "categories",
                "created_at",
                "flg_show",
                "is_custom_topic",
                "sort",
              ])
            )
        );
        res.status(200).json({
          status: "success",
          code: 200,
          body: limitedTopics,
        });
      })
      .catch((error) => res.status(400).json(error));
  } catch (error) {
    console.log(error);
    const { status, data } = error.response;
    return res.json({
      code: status,
      data: 0,
      message: data,
    });
  }
};
