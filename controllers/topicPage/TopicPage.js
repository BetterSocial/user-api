const ClientError = require("../../exceptions/ClientError");
const ConnectGetstream = require("../../services/getstream/ConnectGetstream");
const GetstreamService = require("../../services/getstream/GetstreamService");
const TopicPageValidator = require("../../validators/topicPage");

class TopicPage {
  constructor() {
    const client = ConnectGetstream;
    this._getStreamService = new GetstreamService(client);
    this._validator = TopicPageValidator;
    this.getTopicPages = this.getTopicPages.bind(this);
    this.getTopicPageById = this.getTopicPageById.bind(this);

  }

  async getTopicPages(req, res) {
    let { id } = req.params;

    try {
      this._validator.validateGetTopicPages({ id });
      const topicPages = await this._getStreamService.getTopicPages(id);
      res.status(200).json({
        code: 200,
        status: 'success',
        message: "Success get topic pages",
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

  async getTopicPageById(req, res) {
    let { id, id_gte } = req.params;

    try {
      this._validator.validateGetTopicPageByID({ id, id_gte });
      const topicPage = await this._getStreamService.getTopicPageById(id, id_gte);
      res.status(200).json({
        code: 200,
        status: 'success',
        message: "Success get topic page",
        data: topicPage,
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