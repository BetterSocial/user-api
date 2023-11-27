/**
 * @typedef {Object} TenorBaseReqeust
 * @property {number} limit
 * @property {string} country
 * @property {string} locale
 * @property {string} contentFilter
 * @property {string} ar_range
 * @property {string} media_filter
 */

/**
 * @typedef {Object} TenorRegisterShareRequest
 * @property {string} id
 * @property {string} q
 * @property {string} country
 * @property {string} locale
 */

/**
 * @typedef {Object} TenorSearchGifQueryParamsExtended
 * @property {string} q
 */

/**
 * @typedef {TenorBaseReqeust & TenorSearchGifQueryParamsExtended} TenorSearchGifQueryParams
 * @property {string} q
 */

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

module.exports = {};
