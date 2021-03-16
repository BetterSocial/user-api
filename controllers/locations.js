const Location = require("../databases/models").location;

module.exports = {
  list(req, res) {
    return Location.findAll()
      .then((todos) => res.status(200).json(todos))
      .catch((error) => res.status(400).json(error));
  },

  
};
