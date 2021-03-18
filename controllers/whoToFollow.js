const Users = require("../databases/models").User;

module.exports = {
  whoToFollow(req, res) {
    return Users.findAll({})
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
  },
};
