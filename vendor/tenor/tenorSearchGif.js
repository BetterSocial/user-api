/**
 * @typedef {object} TenorSearchGifResponse
 * @property {string} id
 * @property {string} title
 * @property {object} media_formats
 * @property {object} media_formats.gif
 * @property {string} media_formats.gif.url
 * @property {number} media_formats.gif.duration
 * @property {string} media_formats.gif.preview
 * @property {number[]} media_formats.gif.dims
 * @property {number} media_formats.gif.size
 * @property {number} created
 * @property {string} content_description
 * @property {string} itemurl
 * @property {string} url
 * @property {string[]} tags
 * @property {} flags
 * @property {boolean} hasaudio
 * @property {string} next
 */

const Environment = require('../../config/environment');

/**
 * @typedef {Object} TenorSearchGifQueryParams
 * @property {string} q
 * @property {number} limit
 * @property {string} country
 * @property {string} locale
 * @property {string} contentFilter
 * @property {string} ar_range
 * @property {string} media_filter
 */

/**
 *
 * @param {TenorSearchGifQueryParams} queryParamsObject
 * @param {import(".").TenorApi} tenorApi
 * @param {import(".").TenorUrl} tenorUrl
 * @returns {Promise<TenorSearchGifResponse[]>}
 * @throws {Error}
 */
const tenorSearchGif = async (queryParamsObject, tenorApi, tenorUrl) => {
  const response = await tenorApi.get(tenorUrl.search, {
    params: {
      ...queryParamsObject,
      key: Environment.TENOR_V2_API_KEY
    }
  });

  return Promise.resolve(response?.data?.results);
};

module.exports = tenorSearchGif;
