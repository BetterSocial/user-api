const Location = require("../databases/models").location;

module.exports = {
  location(req, res) {
    return Location.findAll()
      .then((todos) => res.status(200).json(todos))
      .catch((error) => res.status(400).json(error));
  },
};
