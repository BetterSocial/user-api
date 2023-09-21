const getValue = require('../getValue');
const setValue = require('../setValue');

const REDIS_DOMAIN_CREDDER_SCORE_KEY = 'DOMAINCREDDERSCORE_';
const REDIS_DOMAIN_CREDDER_LAST_CHECKED_KEY = 'DOMAINCREDDERLASTCHECKED_';

/**
 *
 * @param {String} domainPageId
 * @returns Number
 */
const getDomainCredderScore = async (domainPageId) => {
  let credderScore = getValue(`${REDIS_DOMAIN_CREDDER_SCORE_KEY}${domainPageId}`);
  return credderScore;
};

/**
 *
 * @param {String} domainPageId
 * @returns
 */
const getDomainCredderLastChecked = async (domainPageId) => {
  let credderLastChecked = getValue(`${REDIS_DOMAIN_CREDDER_LAST_CHECKED_KEY}${domainPageId}`);
  return credderLastChecked;
};

/**
 *
 * @param {String} domainPageId
 * @param {Number} credderScore
 */
const setDomainCredderScore = async (domainPageId, credderScore) => {
  setValue(`${REDIS_DOMAIN_CREDDER_SCORE_KEY}${domainPageId}`, credderScore);
};

/**
 *
 * @param {String} domainPageId
 * @param {Number} lastChecked
 */
const setDomainCredderLastChecked = async (domainPageId, lastChecked) => {
  setValue(`${REDIS_DOMAIN_CREDDER_LAST_CHECKED_KEY}${domainPageId}`, lastChecked);
};

const RedisDomainHelper = {
  getDomainCredderLastChecked,
  getDomainCredderScore,
  setDomainCredderLastChecked,
  setDomainCredderScore
};

module.exports = RedisDomainHelper;
