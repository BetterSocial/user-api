const {default: axios} = require('axios');
const Environment = require('../../config/environment');

const tenorSearchGif = require('./tenorSearchGif');
const tenorListFeaturedGif = require('./tenorListFeaturedGif');
const tenorRegisterShareGif = require('./tenorRegisterShareGif');

/**
 * @typedef {import('axios').AxiosInstance} TenorApi
 */
const tenorApi = axios.create({
  baseURL: Environment.TENOR_V2_BASE_URL
});

/**
 * @typedef {Object} TenorUrl
 * @property {string} search
 * @property {string} featured
 * @property {string} registerShare
 */
const tenorUrl = {
  search: '/search',
  featured: '/featured',
  registerShare: '/registershare'
};

const Tenor = {
  /**
   *
   * @param {import('./types').TenorSearchGifQueryParams} queryParamsObject
   * @returns {Promise<import('./types').TenorSearchGifResponse[]>}
   */
  searchGif: (queryParamsObject) => tenorSearchGif(queryParamsObject, tenorApi, tenorUrl),

  /**
   *
   * @param {import('./types').TenorBaseReqeust} queryParamsObject
   * @returns {Promise<import('./types').TenorSearchGifResponse[]>}
   */
  listFeaturedGif: (queryParamsObject) =>
    tenorListFeaturedGif(queryParamsObject, tenorApi, tenorUrl),

  /**
   *
   * @param {import('./types').TenorRegisterShareRequest} queryParamsObject
   * @returns {Promise<import('./types').TenorSearchGifResponse[]>}
   */
  registerShareGif: (queryParamsObject) =>
    tenorRegisterShareGif(queryParamsObject, tenorApi, tenorUrl)
};

module.exports = {
  Tenor,
  tenorApi
};
