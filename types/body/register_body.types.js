/**
 * @typedef {Object} RegisterBodyData
 * @property {string} follow_source
 * @property {string[]} follows
 * @property {string[]} local_community
 * @property {string[]} topics
 * @property {RegisterBodyData.Users} users
 *
 */

/**
 * @typedef {Object} RegisterBodyData.Users
 * @property {string} country_code
 * @property {string} human_id
 * @property {string} status
 * @property {string} username
 * @property {string} [real_name]
 * @property {string} [profile_pic_path]
 * @property {import("cloudinary").UploadApiResponse} [cloudinary = {}]
 */

/**
 * @typedef {Object} RegisterBody
 * @property {RegisterBodyData} data
 */
