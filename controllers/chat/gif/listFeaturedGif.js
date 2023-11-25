const {ResponseSuccess} = require('../../../utils/Responses');
const {Tenor} = require('../../../vendor/tenor');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const listFeaturedGif = async (req, res) => {
  const {limit, country, locale, contentFilter, ar_range, media_filter} = req.query;

  try {
    const response = await Tenor.listFeaturedGif({
      limit,
      country,
      locale,
      contentFilter,
      media_filter,
      ar_range
    });

    return ResponseSuccess(res, 'Success', 200, response);
  } catch (error) {
    console.log(error);
    return ResponseSuccess(res, 'Error', 500, error);
  }
};

module.exports = listFeaturedGif;
