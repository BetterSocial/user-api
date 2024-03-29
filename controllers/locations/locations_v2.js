const {Locations, sequelize} = require('../../databases/models');
const {Op} = require('sequelize');
module.exports = async (req, res) => {
  try {
    let {name, limit = 20, offset = 0} = req.body;

    let stringToCapitalize = '';
    let stringToLowerCase = '';

    // check attribute name
    if (name === undefined) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'name is required'
      });
    }

    // check if name using string
    if (typeof name === 'string') {
      // stringToCapitalize = name
      //   .trim()
      //   .toLowerCase()
      //   .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
      // stringToLowerCase = name;
      stringToCapitalize = name;
      stringToLowerCase = name;
    } else {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'The name format is invalid'
      });
    }

    const locationQuery = `
    SELECT *, 
    (
      CASE 
        WHEN A.location_level = 'Country' THEN 4
        WHEN A.location_level = 'State' THEN 3
        WHEN A.location_level = 'City' THEN 2
        ELSE 1
      END
    ) AS location_rank
    FROM "location" A WHERE 
    A.neighborhood ILIKE :nameQuery 
    OR A.state ILIKE :nameQuery 
    OR A.country ILIKE :nameQuery
    OR A.city ILIKE :nameQuery
    ORDER BY location_rank DESC
    OFFSET :offset
    LIMIT :limit`;

    try {
      const result = await sequelize.query(locationQuery, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          name: name,
          nameQuery: `%${name}%`,
          offset: offset,
          limit: limit
        }
      });
      return res.status(200).json({
        status: 'success',
        code: 200,
        body: result
      });
    } catch (e) {
      return res.status(400).json({error: e});
    }
  } catch (error) {
    const {status, data} = error.response;
    return res.json({
      code: status,
      data: 0,
      message: data
    });
  }
};
