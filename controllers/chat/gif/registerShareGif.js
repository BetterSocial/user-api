const {ResponseSuccess} = require('../../../utils/Responses');
const {Tenor} = require('../../../vendor/tenor');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const registerShareGif = async (req, res) => {
  const {id, q, country, locale} = req.query;

  try {
    const response = await Tenor.registerShareGif({
      id,
      q,
      country,
      locale
    });

    return ResponseSuccess(res, 'Success', 200, response);
  } catch (error) {
    console.log(error);
    return ResponseSuccess(res, 'Error', 500, error);
  }
};

module.exports = registerShareGif;
