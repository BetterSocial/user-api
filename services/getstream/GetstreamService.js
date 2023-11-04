const InvariantError = require('../../exceptions/InvariantError');
const {MAX_FEED_FETCH_LIMIT, GETSTREAM_RANKING_METHOD} = require('../../helpers/constants');

class GetstreamService {
  constructor(client) {
    this._client = client;
    this.getTopicPages = this.getTopicPages.bind(this);
  }

  async getTopicPages(id, limit = MAX_FEED_FETCH_LIMIT, offset = 0) {
    const query = {
      limit,
      reactions: {own: true, recent: true, counts: true},
      ranking: GETSTREAM_RANKING_METHOD,
      offset
    };
    const res = await this._client.feed('topic', id).get(query);
    let data = res.results;
    return data;
  }

  async getTopicPageById(id, id_lt) {
    try {
      const query = {
        limit: 1,
        id_gte: id_lt || '',
        reactions: {own: true, recent: true, counts: true},
        ranking: GETSTREAM_RANKING_METHOD
      };
      const res = await this._client.feed('topic', id).get(query);
      let data = res.results;
      if (!data.length) {
        throw new InvariantError('Topic page not found');
      }
      return data[0];
    } catch (error) {
      console.log(error.error);
      throw new InvariantError(error.error.detail);
    }
  }
}

module.exports = GetstreamService;
