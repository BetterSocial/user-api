const { Op } = require("sequelize");
const Location = require("../databases/models").location;

module.exports = {
  list(req, res) {
    let { name } = req.body;

    let stringToCapitalize = "";
    let stringToLowerCase = "";

    // check attribute name
    if (name === undefined) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "name is required",
      });
    } 
    
    // check if name using string
    if(typeof name === "string") {
      stringToCapitalize = name
        .trim()
        .toLowerCase()
        .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
      stringToLowerCase = name;
    }else {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "The name format is invalid",
      });
    }

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
              [Op.like]: `%${stringToLowerCase.toLowerCase()}%`,
            },
          },
        ],
      },
    })
      .then((list) => {
        res.status(200).json({
          status: "success",
          code: 200,
          body: list,
        });
      })
      .catch((error) => res.status(400).json(error));
  },
};
