const Environment = require('../../config/environment');

/**
 *
 * @param {import('./types').TenorSearchGifQueryParams} queryParamsObject
 * @param {import(".").TenorApi} tenorApi
 * @param {import(".").TenorUrl} tenorUrl
 * @returns {Promise<import('./types').TenorSearchGifResponse[]>}
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
