const { updateActivity } = require("../../services/getstream");

const putMainFeed = async (req, res) => {
  try {
    const id = req.body.id;
    const set = {
      post_type: 2,
    };
    await updateActivity(id, set);
    return res.status(200).json({
      code: 200,
      status: "success",
      data: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      status: "error",
      data: null,
    });
  }
};

module.exports = {
  putMainFeed,
};
