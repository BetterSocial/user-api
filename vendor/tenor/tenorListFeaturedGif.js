const Environment = require('../../config/environment');

/**
 *
 * @param {import('./types').TenorBaseReqeust} queryParamsObject
 * @param {import(".").TenorApi} tenorApi
 * @param {import(".").TenorUrl} tenorUrl
 * @returns {Promise<import('./types').TenorSearchGifResponse[]>}
 * @throws {Error}
 */
const tenorListFeaturedGif = async (queryParamsObject, tenorApi, tenorUrl) => {
  const response = await tenorApi.get(tenorUrl.featured, {
    params: {
      ...queryParamsObject,
      key: Environment.TENOR_V2_API_KEY
    }
  });

  return Promise.resolve(response?.data?.results);
};

module.exports = tenorListFeaturedGif;
