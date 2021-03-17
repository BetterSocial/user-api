const Topics = require("../databases/models").topics;
const groupBy = require("lodash/groupBy");

module.exports = {
  list(req, res) {
    return Topics.findAll()
      .then((todos) => {
        const response = groupBy(todos, function (n) {
          return n.categories;
        });
        res.status(200).json(response);
      })
      .catch((error) => res.status(400).json(error));
  },
};
