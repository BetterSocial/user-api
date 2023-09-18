const BetterSocialElasticSearch = require('../client');
const esb = require('elastic-builder');

class BetterSocialElasticSearchBaseRepo {
  #indexName = '';

  constructor(indexName) {
    this.indexName = indexName;
  }

  getIndexName() {
    return this.indexName;
  }

  /**
   *
   * @param {esb.RequestBodySearch} body
   * @returns
   */
  async search(body) {
    return await BetterSocialElasticSearch.search(this, body);
  }

  async index(id, item) {
    return await BetterSocialElasticSearch.index(this, id, item);
  }
}

module.exports = BetterSocialElasticSearchBaseRepo;
