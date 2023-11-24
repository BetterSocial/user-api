const {default: axios} = require('axios');
const Environment = require('../../config/environment');

const tenorSearchGif = require('./tenorSearchGif');

/**
 * @typedef {import('axios').AxiosInstance} TenorApi
 */
const tenorApi = axios.create({
  baseURL: Environment.TENOR_V2_BASE_URL
});

/**
 * @typedef {Object} TenorUrl
 * @property {string} search
 */
const tenorUrl = {
  search: '/search'
};

const Tenor = {
  /**
   *
   * @param {import('./tenorSearchGif').TenorSearchGifQueryParams} queryParamsObject
   * @returns {Promise<import('./tenorSearchGif').TenorSearchGifResponse[]>}
   */
  searchGif: (queryParamsObject) => tenorSearchGif(queryParamsObject, tenorApi, tenorUrl)
};

module.exports = {
  Tenor,
  tenorApi
};
