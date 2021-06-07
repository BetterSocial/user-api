const { Locations } = require("../../databases/models");
const { Op } = require("sequelize");
module.exports = async (req, res) => {
  try {
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
    if (typeof name === "string") {
      // stringToCapitalize = name
      //   .trim()
      //   .toLowerCase()
      //   .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
      // stringToLowerCase = name;
      stringToCapitalize = name;
      stringToLowerCase = name;
    } else {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "The name format is invalid",
      });
    }

    return Locations.findAll({
      where: {
        [Op.or]: [
          {
            neighborhood: {
<<<<<<< HEAD
              [Op.iLike]: `%${name}%`,
=======
              [Op.like]: `%${name}%`,
>>>>>>> 268205c6864fec813f07eae1ac9819ac631d4227
            },
          },
          {
            city: {
<<<<<<< HEAD
              [Op.iLike]: `%${name}%`,
=======
              [Op.like]: `%${name}%`,
>>>>>>> 268205c6864fec813f07eae1ac9819ac631d4227
            },
          },
          {
            state: {
<<<<<<< HEAD
              [Op.iLike]: `%${stringToCapitalize.toUpperCase()}%`,
=======
              [Op.like]: `%${stringToCapitalize.toUpperCase()}%`,
>>>>>>> 268205c6864fec813f07eae1ac9819ac631d4227
            },
          },
          {
            country: {
<<<<<<< HEAD
              [Op.iLike]: `%${name}%`,
=======
              [Op.like]: `%${name}%`,
>>>>>>> 268205c6864fec813f07eae1ac9819ac631d4227
            },
          },
        ],
        status: "Y",
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
  } catch (error) {
    const { status, data } = error.response;
    return res.json({
      code: status,
      data: 0,
      message: data,
    });
  }
};
