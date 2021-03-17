const { Op } = require("sequelize");
const Location = require("../databases/models").location;

module.exports = {
  list(req, res) {
    let { name } = req.body;
    let stringToCapitalize = name
      .trim()
      .toLowerCase()
      .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
    return Location.findAll({
      where: {
        [Op.or]: [
          {
            neighborhood: {
              [Op.like]: `%${stringToCapitalize}%`,
            },
          },
          {
            neighborhood: {
              [Op.like]: `%${name}%`,
            },
          },
          {
            neighborhood: {
              [Op.like]: `%${name.toLowerCase()}%`,
            },
          },
        ],
      },
    })
      .then((list) => res.status(200).json(list))
      .catch((error) => res.status(400).json(error));
  },
};
