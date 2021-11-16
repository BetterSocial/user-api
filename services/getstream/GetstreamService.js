const stream = require("getstream");
const InvariantError = require("../../exceptions/InvariantError");
const { MAX_FEED_FETCH_LIMIT } = require("../../helpers/constants");

class GetstreamService {

  constructor(client) {
    this._client = client;
    this.getTopicPages = this.getTopicPages.bind(this);
  }

  async getTopicPages(id,) {
    const query = {
      limit: MAX_FEED_FETCH_LIMIT,
      reactions: { own: true, recent: true, counts: true },
    };
    const res = await this._client.feed("topic", id).get(query);
    let data = res.results
    if (!data.length) {
      throw new InvariantError('Topic page not found');
    }
    return data;
  }

  async getTopicPageById(id, id_lt) {
    try {
      const query = {
        limit: 1,
        id_gte: id_lt || "",
        reactions: { own: true, recent: true, counts: true },
      };
      const res = await this._client.feed("topic", id).get(query);
      let data = res.results
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
