const { User } = require("../../databases/models");
module.exports = async (req, res) => {
  try {
    return User.findAll({})
      .then((list) => {
        let result = [
          {
            group_name: "General",
            data: list,
          },
        ];
        res.status(200).json({
          status: "success",
          code: 200,
          body: result,
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
