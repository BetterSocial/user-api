const stream = require("getstream");
const InvariantError = require("../../exceptions/InvariantError");
const { MAX_FEED_FETCH_LIMIT } = require("../../helpers/constants");

class GetstreamService {

  constructor(client) {
    this._client = client;
    this.getTopicById = this.getTopicById.bind(this);
  }

  async getTopicById(id, id_lt) {
    const query = {
      limit: MAX_FEED_FETCH_LIMIT,
      id_lt: id_lt || "",
      // reactions: { own: true, recent: true, counts: true },
    };
    const res = await this._client.feed("topic", id).get(query);
    let data = res.results
    if (!data.length) {
      throw new InvariantError('Topic page not found');
    }
    return data;
  }
}

module.exports = GetstreamService;
