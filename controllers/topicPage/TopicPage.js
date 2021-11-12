const ClientError = require("../../exceptions/ClientError");
const ConnectGetstream = require("../../services/getstream/ConnectGetstream");
const GetstreamService = require("../../services/getstream/GetstreamService");

class TopicPage {
  constructor() {
    const client = ConnectGetstream;
    this._getStreamService = new GetstreamService(client);
    this.getTopicPageById = this.getTopicPageById.bind(this);
  }

  async getTopicPageById(req, res) {
    let { id, id_lt } = req.query;
    try {
      const topicPages = await this._getStreamService.getTopicById(id, id_lt);
      res.status(200).json({
        code: 200,
        status: "Success get topic page",
        data: topicPages,
      })
    } catch (error) {
      if (error instanceof ClientError) {
        return res.status(error.statusCode).json({
          "code": error.statusCode,
          "status": 'fail',
          "message": error.message,
          "data": "null"
        });
      }

      return res.status(500).json({
        "code": error.statusCode,
        "status": 'error',
        "message": 'Internal server error',
        "data": "null"
      });
    }
  }
}

module.exports = TopicPage;